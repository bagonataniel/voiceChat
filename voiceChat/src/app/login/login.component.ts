import { Component } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { MainService } from '../services/main.service';
import { supabase } from '../core/supabase.client';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private supabase: SupabaseService, private router: Router) { }

  async signIn() {
    this.supabase.signIn(this.email, this.password).then(async (response) => {
      console.log(response);
      if (!response.error) {
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
          this.supabase.setUser(data.user);
        }
        this.router.navigate(['/']);
      }
      else {
        this.errorMessage = response.error.message;
      }
    })
  }
}
