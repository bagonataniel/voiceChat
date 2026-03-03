import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';


@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient("https://yublnlwgsacateiatolf.supabase.co", "sb_publishable_c-fD4dKbV0ZD1dViI6_ZUA_OQyIHreg");
  }

  async signUp(email: string, password: string, name: string) {
    return this.supabase.auth.signUp({ email, password, options: { data: { name } } });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async getSession(): Promise<any> {
    return this.supabase.auth.getSession();
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

}
