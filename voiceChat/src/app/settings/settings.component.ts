import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { SupabaseService } from '../services/supabase.service';
import { UploadEvent } from 'primeng/fileupload';
import { supabase } from '../core/supabase.client';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  items: MenuItem[] | undefined;
  accountInformation: any;
  profilePicUrl: string = "";

  constructor(private supabase: SupabaseService) { }

  async ngOnInit() {
    await this.supabase.getSession().then(result => {
      this.accountInformation = result
    });
    this.getProfilePicture()
    console.log(this.accountInformation);
    this.items = [
      {
        label: 'Account',
        items: [
          {
            label: 'Personal information',
            icon: 'pi pi-plus'
          },
          {
            label: 'Profile',
            icon: 'pi pi-search'
          },
          {
            label: 'Logout',
            icon: 'pi pi-search'
          }
        ]
      }
    ];
  }

  getProfilePicture() {
    const { data } = supabase.storage.from('avatars').getPublicUrl(`public/${this.accountInformation.data.session.user.id}/avatar`)
    this.profilePicUrl = data.publicUrl
    console.log(data);
  }

  onUpload(event: any) {
    const files: File[] = event.files;
    const filePath = `public/${this.accountInformation.data.session.user.id}/avatar`
    console.log(event.files[0])

    supabase.storage.from("avatars").update(filePath, files[0]).then(response => {
      console.log(response);
      supabase.from("profiles").update({avatar_url: ""})
    })
  }

}
