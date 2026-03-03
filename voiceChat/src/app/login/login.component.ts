import { Component } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private supabase: SupabaseService){}

  async signIn(){
    this.supabase.signIn(this.email, this.password).then((response) => {
      console.log(response);
    })
  }
}
