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
  selectedUser: any = [];

  constructor(private supabase: SupabaseService, private router: Router, private mainService: MainService) { }

  ngOnInit() {
    this.selectGroupUsers();
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
    if (this.selectedUser?.user_id === user.user_id) {
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
}
