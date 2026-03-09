import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  username: string = "";

  constructor(private router: Router, private supabase: SupabaseService){}

  async ngOnInit() {
    await this.supabase.getSession().then((response) => {
      if (response.data.session) {
        this.username = response.data.session.user.user_metadata.name || '_username_';
      }
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
}
