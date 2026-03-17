import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { supabase } from '../../core/supabase.client';
import { SupabaseService } from '../../services/supabase.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateGroupComponent } from '../create-group/create-group.component';
import { JoinGroupComponent } from '../join-group/join-group.component';
import { MainService } from '../../services/main.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit{
  groups: any[] = [];
  userId: string = '';
  items: MenuItem[] | undefined;
  selectedGroup: any;

  constructor(private supabaseService: SupabaseService, private dialog: MatDialog, private mainService: MainService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.items = [{ label: 'Leave Group', icon: 'pi pi-sign-out', command: async () => { await this.leaveGroup(this.selectedGroup); }}];
    this.userId = await this.supabaseService.getSession().then((response) => {
      if (response.data.session) {
        return response.data.session.user.id || '';
      }});
    this.fetchGroups();
  }

  async leaveGroup(group: any) {
    await supabase.from('user_groups').delete().eq('group_id', group.id).eq('user_id', this.userId);
    this.fetchGroups();
    this.router.navigate(['/']);
  };

  async fetchGroups() {
    let { data: groups, error } = await supabase.from('groups').select('id, name, color, user_groups!inner(user_id)').eq('user_groups.user_id', this.userId);    
    this.groups = groups || [];
    this.mainService.setGroups(this.groups);
  }

  createGroup() {
    const dialogRef = this.dialog.open(CreateGroupComponent, {
      width: '500px', // optional
      height: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.fetchGroups();
    });
  }

  addGroup(){
    const dialogRef = this.dialog.open(JoinGroupComponent, {
      width: '500px',
      height: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.fetchGroups();
    });
  }
}
