import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { authGuardGuard } from './guards/auth-guard.guard';
import { loggedInGuard } from './guards/logged-in.guard';

const routes: Routes = [
  {path: '', component: MainComponent, canActivate: [authGuardGuard]},
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent, canActivate: [loggedInGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
