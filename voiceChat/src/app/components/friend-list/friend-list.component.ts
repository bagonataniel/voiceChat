import { Component, OnInit, ViewChild } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { supabase } from '../../core/supabase.client';
import { MatButton } from "@angular/material/button";
import { BrowserModule } from "@angular/platform-browser";
import { MenuItemCommandEvent } from 'primeng/api';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrl: './friend-list.component.css'
})
export class FriendListComponent implements OnInit {
  userId: string = '';
  friends: any[] = [];
  pendingFriendRequests: any[] = [];
  items: any[] = [];
  @ViewChild('menu') menu!: any;

  constructor(private supabase: SupabaseService) { 
        this.items = [];
  }

    openMenu(event: MouseEvent, friend: any) {
    this.items.push(
      { 
        label: 'Remove Friend', 
        icon: 'pi pi-fw pi-times',
        data: friend, // Attach the specific friend object to the menu item
        command: (event: MenuItemCommandEvent) => this.removeFriend(event)
      }
    );
    // Open the menu at the event location
    this.menu.toggle(event);
  }

  ngOnInit(): void {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        this.userId = user.id;
        this.loadFriends();
      }
    });
  }

  async removeFriend(friend: any) {
    const id = friend.item.data.id;
    
    try {
      const { data, error } = await supabase.from('friends').delete().eq('id', id);
      if (error) {
        console.error('Error removing friend:', error);
        return;
      }
    }
    catch (error) {
      console.error('Unexpected error:', error);
    }
    this.friends = this.friends.filter(f => f.id !== id);
  }

  async loadFriends() {
    const { data, error } = await supabase.from('friends').select(`*, user:profiles!friends_user_id_fkey(*), friend:profiles!friends_friend_id_fkey(name, avatar_url, status_message, status)`)
      .or(`user_id.eq.${this.userId},friend_id.eq.${this.userId}`);
    if (error) {
      console.error('Error fetching friends:', error);
    }
    else {
      data.map((friend) => {
        if (friend.status === 'pending') {
          if (friend.user_id === this.userId) {
            // Sent friend request
            this.pendingFriendRequests.push({ ...friend.friend, created_at: friend.created_at, id: friend.id, sentByCurrentUser: true });
          }
          else if (friend.friend_id === this.userId) {
            // Received friend request
            this.pendingFriendRequests.push({ ...friend.user, created_at: friend.created_at, id: friend.id, sentByCurrentUser: false });
          }
        }
        else {
          if (friend.user_id === this.userId) {
            // Sent friend request
            this.friends.push({ ...friend.friend, created_at: friend.created_at, id: friend.id, sentByCurrentUser: true });
          }
          else if (friend.friend_id === this.userId) {
            // Received friend request
            this.friends.push({ ...friend.user, created_at: friend.created_at, id: friend.id, sentByCurrentUser: false });
          }
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
      this.friends.push(this.pendingFriendRequests.find(f => f.id === id));
      this.pendingFriendRequests = this.pendingFriendRequests.filter(f => f.id !== id);

    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

  async rejectFriendRequest(id: any) {
    try {
      const { data, error } = await supabase.from('friends').delete().eq('id', id);

      this.pendingFriendRequests = this.pendingFriendRequests.filter(f => f.id !== id);

      console.log("friend request rejected");
      
      if (error) {
        console.error('Error rejecting friend request:', error);
        return;
      }
    } catch (error) {
      
    }
  }
}
