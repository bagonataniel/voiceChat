import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { supabase } from '../../core/supabase.client';

@Component({
  selector: 'app-group-users',
  templateUrl: './group-users.component.html',
  styleUrl: './group-users.component.css'
})
export class GroupUsersComponent implements OnInit, OnChanges {
  GroupParticipants: any[] = [];
  @Input() selectedGroup!: number;

  constructor(private supabase: SupabaseService, private router: Router) { }

  ngOnInit() {
    this.selectGroupUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedGroup'] && !changes['selectedGroup'].firstChange) {
      this.selectGroupUsers();
    }
  }

  async selectGroupUsers() {
    const { data, error } = await supabase.from('user_groups').select(`user_id, profiles!inner(name)`).eq('group_id', this.selectedGroup);
    this.GroupParticipants = data || [];
    if (error) {
      console.error('Error fetching group participants:', error);
      return;
    }
  }

  logout() {
    this.supabase.signOut().then(() => {
      console.log('Logged out successfully');
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  }
}
