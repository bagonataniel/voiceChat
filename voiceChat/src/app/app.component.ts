import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'voiceChat';
  isLoggedIn = false;

  constructor(private supabase: SupabaseService) { }

  ngOnInit() {
    // Subscribe to login state changes
    this.supabase.loggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

}
