import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  //standalone: true
})
export class DashboardComponent { 
  //userEmail: string = 'Гость';
  users: any[] = [];
  error = '';

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
    // const user = this.authService.getCurrentUser();
    // console.log('Текущий пользователь:', user); // ✅ Смотри, есть ли `token`
    // this.userEmail = user?.email || 'Гость';
    
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.get('/api/user/all').subscribe({
      next: (data: any) => {
        console.log('Получены пользователи:', data.users);
        this.users = data.users || [];
      },
      error: (err) => {
        this.error = 'Не удалось загрузить список пользователей';
        console.error('Ошибка загрузки:', err.message);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}