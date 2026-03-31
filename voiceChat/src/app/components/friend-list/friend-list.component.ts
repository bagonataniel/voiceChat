import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { supabase } from '../../core/supabase.client';
import { MatButton } from "@angular/material/button";
import { BrowserModule } from "@angular/platform-browser";

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrl: './friend-list.component.css'
})
export class FriendListComponent implements OnInit {
  userId: string = '';
  friends: any[] = [];

  constructor(private supabase: SupabaseService) { }

  ngOnInit(): void {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        this.userId = user.id;
        this.loadFriends();
      }
    });
  }

  async loadFriends() {
    const { data, error } = await supabase.from('friends').select(`*, user:profiles!friends_user_id_fkey(*), friend:profiles!friends_friend_id_fkey(name, avatar_url, status_message)`)
      .or(`user_id.eq.${this.userId},friend_id.eq.${this.userId}`);
    if (error) {
      console.error('Error fetching friends:', error);
    } else {
      data.map((friend) => {
        if (friend.user_id === this.userId) {
          this.friends.push({ ...friend.friend, created_at: friend.created_at, status: friend.status, id: friend.id, sentByCurrentUser: true });
        }
        else if (friend.friend_id === this.userId) {
          this.friends.push({ ...friend.user, created_at: friend.created_at, status: friend.status, id: friend.id, sentByCurrentUser: false });
        }
      })
    }
  }

  async acceptFriendRequest(id: any) {
    try {
      const { data, error } = await supabase.from('friends').update({ status: 'accepted' }).eq('id', id);

      if (error) {
        console.error('Error accepting friend request:', error);
        return;
      }

      console.log('Friend request accepted successfully:', data);
      this.friends = this.friends.map(f => f.id === id ? { ...f, status: 'accepted' } : f);

    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }
}
