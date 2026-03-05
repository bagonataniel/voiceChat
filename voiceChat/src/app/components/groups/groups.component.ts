import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { supabase } from '../../core/supabase.client';
import { SupabaseService } from '../../services/supabase.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateGroupComponent } from '../create-group/create-group.component';
import { JoinGroupComponent } from '../join-group/join-group.component';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit{
  groups: any[] = [];
  userId: string = '';

  constructor(private supabaseService: SupabaseService, private dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    this.userId = await this.supabaseService.getSession().then((response) => {
      if (response.data.session) {
        return response.data.session.user.id || '';
      }});
    this.fetchGroups();
  }
  async fetchGroups() {
    let { data: groups, error } = await supabase.from('groups').select('id, name, color, user_groups!inner(user_id)').eq('user_groups.user_id', this.userId);    
    this.groups = groups || [];
    console.log("group list", groups);
  }

  @Output() groupSelected = new EventEmitter<number>();
  async selectGroup(groupId: number) {
    this.groupSelected.emit(groupId);
  }

  createGroup() {
    const dialogRef = this.dialog.open(CreateGroupComponent, {
      width: '500px', // optional
      height: '400px',
      data: { message: 'Hello from parent!' }, // optional
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
      this.fetchGroups(); // Refresh the groups list after closing the dialog
    });
  }

  addGroup(){
    const dialogRef = this.dialog.open(JoinGroupComponent, {
      width: '500px', // optional
      height: '400px',
      data: { message: 'Hello from parent!' }, // optional
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
    });
  }
}
