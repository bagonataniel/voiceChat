import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { supabase } from '../core/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  async signUp(email: string, password: string, name: string) {
    return supabase.auth.signUp({ email, password, options: { data: { name } } });
  }

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async getSession(): Promise<any> {
    return supabase.auth.getSession();
  }

  async signOut() {
    return supabase.auth.signOut();
  }

}
