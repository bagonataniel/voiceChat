import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { supabase } from '../../core/supabase.client';
import { Popover } from 'primeng/popover';
import { MainService } from '../../services/main.service';
import { MenuItem, MessageService } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';

@Component({
  selector: 'app-group-users',
  templateUrl: './group-users.component.html',
  styleUrl: './group-users.component.css'
})
export class GroupUsersComponent implements OnInit, OnChanges {
  GroupParticipants: any[] = [];
  @Input() selectedGroup!: number;
  @ViewChild('op') op!: Popover;
  @ViewChild('cm') cm!: ContextMenu;
  selectedUser: any = null;
  selectedUserContextMenu: any = null;
  userId: string = '';
  currentUserRole: string = '';
  friendIds: string[] = [];
  ContextMenuAdmin: MenuItem[] = [{ label: 'Kick User', icon: 'pi pi-sign-out', command: async () => { await this.kickUser(this.selectedUserContextMenu); } }, { label: 'Change Role', icon: 'pi pi-pencil', items: [] }, { label: 'Add Friend', icon: 'pi pi-user-plus', command: async () => { await this.addFriend(this.selectedUser); } }]
  ContextMenuMember: MenuItem[] = [{ label: 'Report User', icon: 'pi pi-exclamation-triangle', command: async () => { console.log("Reported"); } }];
  groupRoleOrder: string[] = [];

  constructor(private supabase: SupabaseService, private router: Router, private mainService: MainService, private messageService: MessageService) { }

  async ngOnInit() {
    this.userId = await this.supabase.getUserId();
    this.supabase.getEnumValues('roles').then(({ data }) => {
      this.groupRoleOrder = data as string[];
      this.groupRoleOrder.forEach(role => {
        this.ContextMenuAdmin[1].items?.push({ label: role, command: async () => { await this.changeUserRole(this.selectedUserContextMenu, role); } });
      });
    });

    this.selectGroupUsers();
    const { data, error } = await supabase.from('friends').select("*").or(`user_id.eq.${this.userId},friend_id.eq.${this.userId}`).or("status.eq.pending, status.eq.accepted");
    console.log(data);
    
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
      this.GroupParticipants = this.groupRoleOrder.map(role => ({
        role,
        members: data.filter(member => member.role === role)
      }));
      this.currentUserRole = this.GroupParticipants.find(group => group.members.some((member: any) => member.id === this.userId))?.role || '';
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

  openContextMenu(event: any, user: any) {
    this.selectedUserContextMenu = user;
    this.cm.show(event);
  }

  async changeUserRole(user: any, newRole: string) {
    await supabase.from('user_groups').update({ role: newRole }).eq('user_id', user.id).eq('group_id', this.selectedGroup).then(({ data, error }) => {
      if (error) {
        console.error('Error changing user role:', error);
      } else {
        console.log('User role changed successfully:', data);
        this.selectGroupUsers();
      }
    });
  }

  async kickUser(user: any) {
    await supabase.from('user_groups').delete().eq('user_id', user.id).eq('group_id', this.selectedGroup).then(({ data, error }) => {
      if (error) {
        console.error('Error kicking user:', error);
      } else {
        console.log('User kicked successfully:', data);
        this.selectGroupUsers();
      }
    });
  }

  async addFriend(user: any) {
    await supabase.from('friends').insert({ user_id: this.userId, friend_id: user.id }).then(({ data, error }) => {
      if (error) {
        console.error('Error adding friend:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add friend.' });
      } else {
        console.log('Friend added successfully:', data);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Friend added successfully.' });
        this.friendIds.push(user.id);
      }
    });
  }

  get activeContextMenu() {
    return this.currentUserRole === 'Owner' ? this.ContextMenuAdmin : this.ContextMenuMember;
  }
}
