import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { supabase } from '../../core/supabase.client';
import { Popover } from 'primeng/popover';
import { MainService } from '../../services/main.service';

@Component({
  selector: 'app-group-users',
  templateUrl: './group-users.component.html',
  styleUrl: './group-users.component.css'
})
export class GroupUsersComponent implements OnInit, OnChanges {
  GroupParticipants: any[] = [];
  @Input() selectedGroup!: number;
  @ViewChild('op') op!: Popover;
  selectedUser: any = null;
  userId: string = '';
  friendIds: string[] = [];

  constructor(private supabase: SupabaseService, private router: Router, private mainService: MainService) { }

  async ngOnInit() {
    this.selectGroupUsers();
    this.userId = await this.supabase.getUserId();
    const { data, error } = await supabase.from('friends').select("*").or(`user_id.eq.${this.userId},friend_id.eq.${this.userId}`).eq("status", "accepted");
    if (error) {
      console.error('Error fetching friends:', error);
    } else {     
      data.map((friend) => {
        if (friend.user_id === this.userId) {
          this.friendIds.push(friend.friend_id);
        }
        else if (friend.friend_id === this.userId) {
          this.friendIds.push(friend.user_id);
        }        
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedGroup'] && !changes['selectedGroup'].firstChange) {
      this.selectGroupUsers();
    }
  }

  async selectGroupUsers() {
    this.mainService.setSelectedGroupUsers(this.selectedGroup);
    this.mainService.selectedGroupUsers$.subscribe((data) => {
      this.GroupParticipants = data;
    });
  }

  logout() {
    this.supabase.signOut().then(() => {
      console.log('Logged out successfully');
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  }

  hidePopover() {
    this.op.hide();
  }

  selectUser(event: any, user: any) {    
    if (this.selectedUser?.id === user.id) {
      this.op.hide();
      this.selectedUser = null;
    } else {
      this.selectedUser = user;      
      this.op.show(event);     
      if (this.op.container) {
        this.op.align();
      }
    }
  }

  async addFriend(user: any) {
    await supabase.from('friends').insert({ user_id: this.userId, friend_id: user.id}).then(({ data, error }) => {
      if (error) {
        console.error('Error adding friend:', error);
      } else {
        console.log('Friend added successfully:', data);
      }
    });
  }
}
