import { Injectable } from '@angular/core';
import { supabase } from '../core/supabase.client';
import { BehaviorSubject } from 'rxjs';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initAuthState();
  }

  private async initAuthState() {
    const { data } = await supabase.auth.getSession();
    this.loggedInSubject.next(!!data.session);

    supabase.auth.onAuthStateChange((_event, session) => {
      this.loggedInSubject.next(!!session);
    });
  }

  setUser(user: User | null) {
    this.currentUserSubject.next(user);
  }

  clearUser() {
    this.currentUserSubject.next(null);
  }

  async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? user.id : '';
  }

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (data.user) {
      await supabase.from('profiles').insert([
        { id: data.user.id, name: name, email: email }
      ]);
    }
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async getSession(): Promise<any> {
    return supabase.auth.getSession();
  }

  async isLoggedIn(): Promise<boolean> {
    const { data, error } = await this.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return false;
    }
    return data.session !== null;
  }

  async signOut() {
    return supabase.auth.signOut();
  }

}
