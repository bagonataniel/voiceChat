import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Participant, Room, RoomEvent, ChatMessage } from 'livekit-client'
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { MainService } from '../services/main.service';
import { supabase } from '../core/supabase.client';

interface Message {
  timestamp?: Date;
  participant: string;
  text: string;
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
  participants: any[] = [];
  chatMessages: Message[] = [];
  messageText: string = '';
  isConnected: boolean = false;
  isMuted: boolean = false;
  groups: any[] = []

  constructor(private _http: HttpClient, private supabase: SupabaseService, private router: Router, private mainService: MainService) { }

  async ngOnInit(): Promise<void> {
    await this.supabase.getSession().then((response) => {
      if (response.data.session) {
        this.username = response.data.session.user.user_metadata.name || '';
      }
    })
    let { data: groups, error } = await supabase.from('groups').select('*')
    this.groups = groups || [];
    this.mainService.getToken("test").then(token => {
      this.TOKEN = token;
    }).catch(error => {
      console.error('Error fetching token:', error);
    });
  }

  async joinRoom() {
    this.room = new Room();
    // Connect to LiveKit room
    await this.room.connect(this.LIVEKIT_URL, this.TOKEN);
    this.isConnected = true;
    console.log('Connected to room:', this.room.name);

    const remoteNames = Array.from(this.room.remoteParticipants.values()).map(p => p.name || p.identity);
    this.participants = [
      this.room.localParticipant.name || this.room.localParticipant.identity,
      ...remoteNames
    ];
    console.log(this.participants);

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('Participant connected:', participant.identity);
      this.participants.push(participant.name || participant.identity);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('Participant disconnected:', participant.identity);
      this.participants = this.participants.filter(p => p !== (participant.name || participant.identity));
    });

    this.room.registerTextStreamHandler('chat', async (reader, participantInfo) => {
      const info = reader.info;
      console.log(
        `  Topic: ${info.topic}\n` +
        `  Timestamp: ${info.timestamp}\n` +
        `  ID: ${info.id}\n` +
        `  Size: ${info.size}`
      );

      const text = await reader.readAll();
      this.chatMessages.push({
        participant: participantInfo.identity,
        text: text,
        timestamp: new Date(info.timestamp)
      });
    })

    // Subscribe to incoming audio tracks
    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === 'audio') {
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
        console.log('Receiving audio from', participant.identity);
      }
    });

    // Get microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Publish local audio
    for (const track of stream.getTracks()) {
      await this.room.localParticipant.publishTrack(track);
    }

    console.log('Microphone enabled');
  }

  async sendMessage() {
    if (this.room && this.messageText.trim() !== '') {
      await this.room.localParticipant.sendText(this.messageText, { topic: "chat" });
      this.chatMessages.push({
        participant: this.room.localParticipant.identity,
        text: this.messageText,
        timestamp: new Date()
      });
      this.messageText = '';
    }
  }

  leaveRoom() {
    if (this.room) {
      this.room.disconnect();
      this.isConnected = false;
      console.log('Disconnected');
    }
  }

  toggleMute() {
    if (this.room) {
      console.log(this.room.localParticipant.audioTrackPublications);
      this.isMuted = !this.isMuted;
      this.room.localParticipant.setMicrophoneEnabled(!this.isMuted);
      console.log("muted:", this.isMuted);
    }
  }

  toggleDeafen() {
    if (this.room) {
      this.room.localParticipant.audioLevel = this.room.localParticipant.audioLevel === 0 ? 1 : 0;
    };
  }

  logout() {
    this.supabase.signOut().then(() => {
      console.log('Logged out successfully');
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  }
}