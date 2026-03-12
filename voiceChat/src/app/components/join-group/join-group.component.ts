import { Component } from '@angular/core';
import { supabase } from '../../core/supabase.client';
import { SupabaseService } from '../../services/supabase.service';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.component.html',
  styleUrl: './join-group.component.css'
})
export class JoinGroupComponent {
  groupId: string = '';
  groupData: any[] = [];

  constructor(private supabaseClient: SupabaseService) { }

  async joinGroup() {
    const uId = await this.supabaseClient.getSession().then((response) => {
      if (response.data.session) {
        return response.data.session.user.id || '';
    }});
    console.log(this.groupId);
    
    supabase.from('user_groups').insert({ user_id: uId, group_id: this.groupId }).then(({ data, error }) => {
      if (error) {
        console.error('Error adding user to group:', error);
      } else {
        console.log('User added to group successfully:', data);
      }
    });
  }

  searchGroup() {
    supabase.from('groups').select('*').eq('id', this.groupId).then(({ data, error }) => {
      if (error) {
        console.error('Error searching group:', error);
      } else {
        this.groupData = data || [];
        console.log('Found groups:', this.groupData);
      }
    });
  }
}
