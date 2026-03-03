import { CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

export const authGuardGuard: CanActivateFn = (route, state) => {
  // const supabase = new SupabaseService();
  // const router = new Router();
  // return supabase.getSession().then((response) => {
  //   if(response.data.session){
  //     return true;
  //   } else {
  //     router.navigate(['/login']);
  //     return false;
  //   }
  // })
  return true;
};
