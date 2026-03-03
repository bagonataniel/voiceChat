import { Component } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isHidden: boolean = true;

  constructor(private supabase: SupabaseService){}

  async signIn(){
    this.supabase.signIn(this.email, this.password).then((response) => {
      console.log(response);
    })
    console.log(this.supabase.getSession());
  }
}
