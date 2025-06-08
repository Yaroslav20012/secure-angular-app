import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports:[NgIf, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true
})
export class NavbarComponent {
  userEmail: string = 'Гость';
  private authSubscription: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user && user.email) {
        this.userEmail = user.email;
      } else {
        this.userEmail = 'Гость';
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
