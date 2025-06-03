import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  //standalone: true
})
export class DashboardComponent { 
  userEmail: string = 'Гость';

  constructor(private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    console.log('Текущий пользователь:', user); // ✅ Смотри, есть ли `token`
    this.userEmail = user?.email || 'Гость';
    //Проверяем, есть ли пользователь
    // if (user && user.email) {
    //   this.userEmail = user.email;
    // }
    
    // if (!user) {
    //   this.router.navigate(['/login']);
    // } else {
    //   this.userEmail = user.email;
    // }
  }

  logout(): void {
    this.authService.logout();
  }
}