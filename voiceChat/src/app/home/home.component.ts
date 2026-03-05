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

  onGroupSelected(groupId: number) {
    this.router.navigate([`/main/${groupId}`]);
  }

  async ngOnInit() {
    await this.supabase.getSession().then((response) => {
      if (response.data.session) {
        this.username = response.data.session.user.user_metadata.name || '_username_';
      }
    });
  }
}
