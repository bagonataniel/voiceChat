import { CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const supabase = new SupabaseService();
  const router = new Router();
  supabase.isLoggedIn().then((loggedIn) => {
    if (!loggedIn) {
      router.navigate(['/login']);
    }
  });
  return true;
};
