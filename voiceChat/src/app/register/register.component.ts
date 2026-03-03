import { Component } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  name: string = '';
  isHidden: boolean = true;

  constructor(private supabase: SupabaseService){}

  async signUp(){
    this.supabase.signUp(this.email, this.password, this.name).then((response) => {
      console.log(response);
    })
  }

  hide(){
    this.isHidden = !this.isHidden;
    return this.isHidden;
  }
}
