import { Injectable, OnDestroy } from '@angular/core';
import { supabase } from '../core/supabase.client';
import { Subject } from 'rxjs';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseRealtimeChatService implements OnDestroy {
  private channels = new Map<number, RealtimeChannel>();
  private messageSubjects = new Map<number, Subject<any>>();

  constructor() { }

  getNewMessages$(groupId: number): Subject<any> {
    if (!this.messageSubjects.has(groupId)) {
      const subject = new Subject<any>();
      const channelName = `group-chat-${groupId}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `group_id=eq.${groupId}`
          },
          (payload) => {
            console.log('[Service] New message in group', groupId, payload.new);
            subject.next(payload.new);
          }
        )
        .subscribe((status) => {
          console.log(`[Realtime ${channelName}] status:`, status);
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.cleanup(groupId);
          }
        });

      this.channels.set(groupId, channel);
      this.messageSubjects.set(groupId, subject);
    }

    return this.messageSubjects.get(groupId)!;
  }

  private cleanup(groupId: number) {
    const channel = this.channels.get(groupId);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(groupId);
    }
    const subj = this.messageSubjects.get(groupId);
    if (subj) {
      subj.complete();
      this.messageSubjects.delete(groupId);
    }
  }

  leaveGroup(groupId: number) {
    this.cleanup(groupId);
  }

  ngOnDestroy() {
    for (const groupId of this.channels.keys()) {
      this.cleanup(groupId);
    }
  }
}
