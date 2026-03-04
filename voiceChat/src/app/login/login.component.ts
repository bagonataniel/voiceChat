import { Component } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private supabase: SupabaseService, private router: Router){}

  async signIn(){
    this.supabase.signIn(this.email, this.password).then((response) => {
      console.log(response);
      if (!response.error) {
        this.router.navigate(['/']);
      }
      else {
        this.errorMessage = response.error.message;
      }
    })
  }
}
