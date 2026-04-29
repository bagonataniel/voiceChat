import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { SupabaseService } from '../services/supabase.service';
import { UploadEvent } from 'primeng/fileupload';
import { supabase } from '../core/supabase.client';
import { Router } from '@angular/router';
import { MainService } from '../services/main.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  items: MenuItem[] | undefined;
  accountInformation: any;
  profilePicUrl: string = "";
  editingStatus: boolean = false;
  currentPassword: string = "";
  newPassword: string = "";

  constructor(private supabase: SupabaseService, private router: Router, private mainService: MainService) { }

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
            icon: 'pi pi-search',
            command: () => this.logout()
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

  async editStatus(){
    if (this.editingStatus) {
      const { data, error } = await supabase.from("profiles").update({ status_message: this.accountInformation[0].status_message}).eq("id", this.accountInformation.user.id)
      if (error) {
        console.log("Failed to update profile status", error);
        return;
      }
      this.editingStatus = !this.editingStatus;
    }
    else{
      this.editingStatus = !this.editingStatus;
    }
  }

  async updatePassword(oldPassword: string, newPassword: string) {
    var pwrdMatch = true;
    await supabase.auth.signInWithPassword({ email: this.accountInformation.user.email, password: oldPassword }).then(async response => {
      if (response.error) {
        console.error("Old password is incorrect:", response.error);
        pwrdMatch = false;
      }})
    if (!pwrdMatch) {
      return;
    }
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      console.error("Failed to update password:", error);
      return;
    }
    console.log("Password updated successfully:", data);
  }

  logout() {
    this.supabase.signOut().then(() => {
      console.log('Logged out successfully');
      this.mainService.setSettingsVisibility(false);
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  }
}
