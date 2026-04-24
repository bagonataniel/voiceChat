import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './services/supabase.service';
import { NavigationEnd, Router } from '@angular/router';
import { MainService } from './services/main.service';
import { PresenceService } from './services/presence.service';
import { supabase } from './core/supabase.client';

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
  userId = '';

  constructor(private supabase: SupabaseService, private router: Router, private mainService: MainService, private presenceService: PresenceService) { }

  ngOnInit() {
    this.supabase.loggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
    this.mainService.settingsVisibility$.subscribe((val) => {
      this.visible = val;
    });
    this.supabase.getUserId().then((id) => {
      this.userId = id;
      console.log(this.userId);
      this.sendHeartbeat();
    })
    // await this.presenceService.connect(await this.supabase.getUserId());
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url.split('/')[1];
      }
    });
  }

  sendHeartbeat() {
    if (this.isLoggedIn) {
      setInterval(async () => {
        await supabase
          .from('profiles')
          .update({
            last_seen: new Date().toISOString(),
            status: "online"
          })
          .eq('id', this.userId);
      }, 10000); // every 10 seconds
    }
  }

}
