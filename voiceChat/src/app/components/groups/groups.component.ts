import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { supabase } from '../../core/supabase.client';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit{
  groups: any[] = [];
  userId: string = '';

  constructor(private supabaseService: SupabaseService) {}

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
    
    this.selectGroup(this.groups[0].id);
  }

  @Output() groupSelected = new EventEmitter<number>();
  async selectGroup(groupId: number) {
    this.groupSelected.emit(groupId);
  }
}
