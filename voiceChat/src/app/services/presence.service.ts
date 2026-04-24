import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../core/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private channel: RealtimeChannel | null = null;
  private currentUserId: string | null = null;

  constructor() {}

  async connect(userId: string) {
    if (this.channel) return; // already connected

    this.currentUserId = userId;

    this.channel = supabase.channel('online-users', {
      config: {
        presence: { key: userId }
      }
    });

    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState();
        console.log('🟢 Online users:', state);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log(`🟢 ${key} joined`);
        supabase.from('profiles').update({ status: 'online' }).eq('id', key)
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log(`🔴 ${key} left`);
        supabase.from('profiles').update({ status: 'offline' }).eq('id', key)
      });

    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && this.channel) {
        await this.channel.track({
          user_id: userId,
          online_at: new Date().toISOString()
        });
      }
    });
  }

  disconnect() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.currentUserId = null;
    }
  }

  getOnlineUsers() {
    return this.channel?.presenceState() || {};
  }
}