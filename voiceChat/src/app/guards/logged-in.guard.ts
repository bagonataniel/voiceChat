import { CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

export const loggedInGuard: CanActivateFn = async (route, state) => {
    const supabase = new SupabaseService();
    const router = new Router();
    const response = await supabase.getSession();
    if(response.data.session) {
      router.navigate(['/']);
      return true;
    }
    return false;
};
