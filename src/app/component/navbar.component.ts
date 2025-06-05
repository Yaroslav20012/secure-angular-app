import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  template: `
    <nav>
      @if (isAuthenticated()) {
        <div>
          <span>Привет, {{ userEmail }}!</span>
          <a href="#" (click)="logout()">Выйти</a>
        </div>
      } @else {
        <a routerLink="/login">Войти</a>
        <a routerLink="/register">Зарегистрироваться</a>
      }
    </nav>
  `,
  standalone: true
})
export class NavbarComponent {
  userEmail: string = 'Гость';

  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      this.userEmail = user.email;
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated(); // Теперь вызываем метод из сервиса
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'])
  }
}