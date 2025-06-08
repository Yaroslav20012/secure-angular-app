import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { NavbarComponent } from './component/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { HomeComponent } from './pages/home/home.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  standalone: true,
  animations: [
    trigger('routeAnimations', [
      transition('LoginPage <=> RegisterPage, DashboardPage <=> LoginPage',  [
        query(':enter, :leave', style({ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }), { optional: true }),
        group([
          // Исчезновение уходящей страницы
          query(':leave', [
            animate('300ms ease-out', style({ opacity: 0 }))
          ], { optional: true }),
          // Появление входящей страницы
          query(':enter', [
            style({ opacity: 0 }),
            animate('300ms 300ms ease-in', style({ opacity: 1 }))
          ], { optional: true }),
        ])
      ])
    ])
  ]
})
export class AppComponent {
  title = 'secure-angular-app';

  constructor(private authService: AuthService){}

  sqlExample = "'; DROP TABLE users;--"; // Пример SQLi атаки
  isAuthenticated(): boolean {
    return !this.authService.isAuthenticated();
  }

  isRegisterMode = false;

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
