import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './services/supabase.service';
import { NavigationEnd, Router } from '@angular/router';
import { MainService } from './services/main.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'voiceChat';
  isLoggedIn = false;
  currentRoute: string = "";
  visible = true;

  constructor(private supabase: SupabaseService, private router: Router, private mainService: MainService) { }

  ngOnInit() {
    this.supabase.loggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
    this.mainService.settingsVisibility$.subscribe(val => {
      this.visible = val
    })
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url.split('/')[1];
      }
    });
  }

}
