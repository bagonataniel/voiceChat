import { Component } from '@angular/core';
import { supabase } from '../../core/supabase.client';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.css'
})
export class CreateGroupComponent {
  groupName: string = '';
  groupColor: string = '#000000';

  constructor(private supabaseClient: SupabaseService){}

  createGroup() {
    const uId = this.supabaseClient.getSession().then((response) => {
      if (response.data.session) {
        return response.data.session.user.id || '';
    }});
    console.log("uId: ",uId);
    
    supabase.from('groups').insert({ name: this.groupName, color: this.groupColor }).select().then(({ data, error }) => {
      if (error) {
        console.error('Error creating group:', error);
      } else {
        supabase.from('user_groups').insert({ user_id: uId, group_id: data?.[0].id }).then(({ data, error }) => {
          if (error) {
            console.error('Error adding user to group:', error);
          } else {
            console.log('User added to group successfully:', data);
          }
        });
      }
    })
  }
}
