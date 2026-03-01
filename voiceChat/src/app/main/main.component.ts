import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Participant, Room, RoomEvent } from 'livekit-client'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit{
  LIVEKIT_URL: string = "livekit.url";
  TOKEN: string = "";
  room: Room | null = null;
  participantName: string = '';
  participants: any[] = [];

  constructor(private _http: HttpClient) {}

  ngOnInit(): void {;
  }

  getToken(): Promise<string> {
    return this._http.post<{token: string}>('http://localhost:3000/api/token', { participantName: this.participantName })
      .toPromise()
      .then(data => {
        if (!data) {
          throw new Error('Failed to retrieve token');
        }
        this.TOKEN = data.token;
        console.log('Token received:', this.TOKEN);
        return this.TOKEN;
      });
  }

  async joinRoom() {  
    await this.getToken();

    this.room = new Room();
    // Connect to LiveKit room
    await this.room.connect(this.LIVEKIT_URL, this.TOKEN);
    console.log('Connected to room:', this.room.name);

    const remoteNames = Array.from(this.room.remoteParticipants.values()).map(p => p.name || p.identity);
    this.participants = [
      this.room.localParticipant.name || this.room.localParticipant.identity,
      ...remoteNames
    ];

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

  leaveRoom() {
    if (this.room) {
      this.room.disconnect();
      console.log('Disconnected');
    }
  }

} 
