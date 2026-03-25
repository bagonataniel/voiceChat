import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, isDevMode, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LocalParticipant, Room, RoomEvent } from 'livekit-client'
import { SupabaseService } from '../services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MainService } from '../services/main.service';
import { supabase } from '../core/supabase.client';
import { SupabaseRealtimeChatService } from '../services/supabase-realtime-chat.service';
import { Subscription } from 'rxjs/internal/Subscription';

interface Message {
  id: string,
  content: string
  group_id: number,
  sender_id: string,
  created_at?: Date,
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
  LIVEKIT_URL: string = "wss://chatapp-sd7xe8on.livekit.cloud";
  TOKEN: string = "";
  room: Room | null = null;
  username: string = '';
  localParticipant!: LocalParticipant;
  participants: any[] = [];
  chatMessages: Message[] = [];
  textMessage: string = '';
  isConnected: boolean = false;
  isMuted: boolean = false;
  isDeafened: boolean = false;
  selectedGroup: number = 1;
  selectedGroupName: string = '';
  groupMembers: any[] = [];
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private messagesSub: Subscription | undefined;

  constructor(private _http: HttpClient, private supabase: SupabaseService, private router: Router, private mainService: MainService, private route: ActivatedRoute, private chatService: SupabaseRealtimeChatService) { }

  ngOnInit() {
    this.initialize();
  }

  async joinChat() {
    console.log("joined");
    const channel = supabase.channel(`group-chat-${this.selectedGroup}`).on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${this.selectedGroup}`
      },
      (payload) => {
        console.log('New message:', payload.new)
        this.addMessage(payload.new)
        setTimeout(() => this.scrollToBottom(), 10);
      }
    ).subscribe()
  }

  addMessage(message: any) {
    this.chatMessages.push({ id: message.id, content: message.content, group_id: message.group_id, sender_id: message.sender_id, created_at: new Date(message.created_at) });
  }

  async initialize() {
    this.selectedGroup = Number(this.route.snapshot.paramMap.get('groupId'));
    this.chatMessages = [];

    await Promise.all([
      this.getPreviousMessages(),
      this.getGroupMembersDetails(),
      this.fetchSession()
    ]);

    const newMessages$ = this.chatService.getNewMessages$(this.selectedGroup);
    this.messagesSub = newMessages$.subscribe((newMsg) => {
      this.addMessage(newMsg);
      setTimeout(() => this.scrollToBottom(), 10);
    });
    const token = await this.mainService.getToken(this.username, this.selectedGroupName);
    this.TOKEN = token;
  }

  async fetchSession() {
    await this.supabase.getSession().then((response) => {
      if (response.data.session) {
        this.username = response.data.session.user.user_metadata.name || '_username_';
      }
    });
    this.mainService.groups$.subscribe(groups => {
      this.selectedGroupName = groups.find(g => g.id === this.selectedGroup)?.name || '';
    });
  };

  async getGroupMembersDetails() {
    await supabase.from('user_groups').select('user_id').eq('group_id', this.selectedGroup).then(async response => {
      if (response.data) {
        const userIds = response.data.map(member => member.user_id);
        await supabase.from('profiles').select('id, name, avatar_url').in('id', userIds).then(userResponse => {
          if (userResponse.data) {
            this.groupMembers = userResponse.data;
          }
        });
      }
    });
  }

  scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { console.error('Scroll to bottom failed:', err); }
  }

  async getPreviousMessages() {
    await supabase.from("messages").select("*").eq("group_id", this.selectedGroup).order("created_at", { ascending: true }).limit(50).then(response => {
      if (response.data) {
        this.chatMessages = [
          ...response.data.map(msg => ({
            id: msg.id,
            content: msg.content,
            group_id: msg.group_id,
            sender_id: msg.sender_id,
            created_at: new Date(msg.created_at)
          })),
          ...this.chatMessages
        ];
      }
      setTimeout(() => this.scrollToBottom(), 10);
    });
  }

  enterKeyDown() {
    if (event instanceof KeyboardEvent && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async joinRoom() {
    this.room = new Room();
    // Connect to LiveKit room
    await this.room.connect(this.LIVEKIT_URL, this.TOKEN);
    this.localParticipant = this.room.localParticipant;
    await this.localParticipant.setMicrophoneEnabled(true);
    this.isConnected = true;
    console.log('Connected to room:', this.room.name);

    const remoteNames = Array.from(this.room.remoteParticipants.values()).map(p => p.name || p.identity);
    this.participants = [
      this.room.localParticipant.name || this.room.localParticipant.identity,
      ...remoteNames
    ];

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('Participant connected:', participant.identity);
      this.participants.push(participant.name || participant.identity);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('Participant disconnected:', participant.identity);
      this.participants = this.participants.filter(p => p !== (participant.name || participant.identity));
    });

    // Subscribe to incoming audio tracks
    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === 'audio') {
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
        console.log('Receiving audio from', participant.identity);
      }
    });

    // Get microphone
    // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Publish local audio
    // for (const track of stream.getTracks()) {
    //   await this.room.localParticipant.publishTrack(track);
    // }
  }

  async sendMessage() {
    if (this.textMessage.trim() !== '') {
      await supabase.from('messages').insert({
        content: this.textMessage,
        group_id: this.selectedGroup,
      });
      this.textMessage = '';
    }
  }

  leaveRoom() {
    if (this.room) {
      this.room.disconnect();
      this.isConnected = false;
      console.log('Disconnected');
    }
  }

  async toggleMute() {
    if (this.room) {
      this.isMuted = !this.isMuted;
      await this.localParticipant.setMicrophoneEnabled(!this.isMuted);
    }
  }

  async toggleDeafen() {
    this.isDeafened = !this.isDeafened;
    await this.localParticipant.setMicrophoneEnabled(!this.isMuted);
    if (this.room) {
      this.room.remoteParticipants.forEach(participant => {
        participant.audioTrackPublications.forEach(publication => {
          const track = publication.audioTrack;
          if (track) {
            if (this.isDeafened) {
              track.detach();
            }
            else {
              track.attach();
            }
          }
        })
      })
    };
  }

  getSenderAvatar(sender_id: string): string {
    return this.groupMembers.find(m => m.id === sender_id)?.avatar_url
  }

  getSenderName(sender_id: string): string {
    return this.groupMembers.find(m => m.id === sender_id)?.name
  }
}