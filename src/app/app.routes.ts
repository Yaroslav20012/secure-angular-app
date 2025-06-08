import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
// import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { animate, animation } from '@angular/animations';
import { HomeComponent } from './pages/home/home.component';


export const routes: Route[] = [
  // { path: '', component: HomeComponent }, что было 
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: 'login', component: LoginComponent, data:{animation: 'LoginPage'}},
  { path: 'register', component: RegisterComponent, data:{animation: 'RegisterPage'} },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], data: {animation: 'DashboardPage'} },
  { path: 'home', component: HomeComponent,}
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HomeComponent],
  exports: [RouterModule]
})
export class AppRoutingModule {}