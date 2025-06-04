import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgIf, NgForOf } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [NgIf, NgForOf] // добавим ниже
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
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();

    this.http.get('/api/user/all').subscribe({
      next: (data: any) => {
        this.users = data.users || [];
      },
      error: (err) => {
        console.error('Ошибка загрузки:', err.message);
        this.error = 'Не удалось загрузить список пользователей';
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