import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './services/supabase.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'voiceChat';
  isLoggedIn = false;
  currentRoute: string = "";

  constructor(private supabase: SupabaseService, private router: Router) { }

  ngOnInit() {
    // Subscribe to login state changes
    this.supabase.loggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url.split('/')[1];
      }
    });
  }

}
