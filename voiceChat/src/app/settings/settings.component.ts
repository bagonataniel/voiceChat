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
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      throw new Error("User not authenticated")
    }
    this.accountInformation = data

    this.getProfileData()
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

  async getProfileData() {
    const { data, error } = await supabase.from('profiles').select("*").eq("id", this.accountInformation.user.id)
    this.accountInformation = {...this.accountInformation,...data}
    console.log(this.accountInformation);
    if (!error) {
      this.profilePicUrl = data[0].avatar_url
    }
  }

  async onUpload(event: any) {
    const files: File[] = event.files;
    const userId = this.accountInformation.user.id
    const filePath = `${userId}/avatar.${files[0].name.split('.').pop()}`
    supabase.storage.from("avatars").upload(filePath, files[0], { upsert: true }).then(async response => {
      await this.updateAvatarUrl(filePath)
    })
  }

  async updateAvatarUrl(filePath: string) {
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
    console.log(this.accountInformation.user.id);
    const { data, error } = await supabase.from("profiles").update({ avatar_url: publicUrlData.publicUrl }).eq("id", this.accountInformation.user.id)
    if (error) {
      console.error("Failed to update profile:", error)
    } else {
      this.accountInformation[0].avatar_url = publicUrlData.publicUrl
      this.profilePicUrl = publicUrlData.publicUrl
      console.log("Profile updated:", data)
    }
  }

}
