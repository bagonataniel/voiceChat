import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { supabase } from '../core/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({email, password, options: { data: { name } }});
    if (data.user) {
      await supabase.from('profiles').insert([
        { id: data.user.id, name: name }
      ]);
    }
    return { data, error };
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
