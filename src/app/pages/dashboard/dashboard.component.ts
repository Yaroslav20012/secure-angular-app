  import { Component, OnInit } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { AuthService } from '../../services/auth.service';
  import { Router, RouterModule } from '@angular/router';
  import { CommonModule } from '@angular/common';
  @Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule]
  })
  export class DashboardComponent implements OnInit {
    users: any[] = [];
    error: string = '';
    currentUser: any;

    constructor(
      private http: HttpClient,
      private authService: AuthService,
      private router: Router
    ) {}

    ngOnInit(): void {
      if (!this.authService.isAuthenticated()) {

        console.warn('⚠️ Пользователь не авторизован → редиректим на /login');

        this.router.navigate(['/login']);
        return;
      }

      this.currentUser = this.authService.getCurrentUser();
      

      console.log('🧾 Текущий пользователь из localStorage:', this.currentUser);
      console.log('🧾 Токен:', this.currentUser.token);
      console.log('🧾 Payload:', JSON.parse(atob(this.currentUser.token.split('.')[1])));


      this.http.get('/api/user/all', {withCredentials: true, } ).subscribe({
        next: (data: any) => {

          console.log('📊 Полученные пользователи:', data);

          this.users = data || [];
        },
        error: (err) => {
          console.error('❌ Не удалось получить список пользователей:', err.message);
          this.error = 'Ошибка загрузки данных';
        }
      });
    }

    isUserAdmin(): boolean {
      return this.currentUser?.role === 'admin';
    }

    deleteUser(id: number): void {
      if (this.currentUser.id === id) {
        alert('Невозможно удалить самого себя');
        return;
      }

      if (!confirm('Вы уверены?')) return;

      this.http.delete(`/api/user/${id}`).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
        },
        error: (err) => {
          console.error('Ошибка удаления:', err.message);
          this.error = 'Не удалось удалить пользователя';
        }
      });
    }
  }
