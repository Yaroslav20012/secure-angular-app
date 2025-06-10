  import { Component, OnInit } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { AuthService } from '../../services/auth.service';
  import { Router, RouterModule } from '@angular/router';
  import { CommonModule } from '@angular/common';
  import DOMPurify from 'dompurify';
  import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

  @Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule]
  })
  export class DashboardComponent implements OnInit {
    users: any[] = [];
    filteredUsers: any[] = [];//
    searchQuery: string = '';//
    currentPage = 1;//
    itemsPerPage = 5;//
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


      this.http.get(`${environment.url}/api/user/all`, {withCredentials: true, } ).subscribe({
        next: (data: any) => {

          console.log('📊 Полученные пользователи:', data);

          this.users = data.map((user: { email: any; }) => ({
          ...user,
          email: DOMPurify.sanitize(user.email)
         }));
          this.applyFilter();
        },
        error: (err) => {
          console.error('❌ Не удалось получить список пользователей:', err.message);
          this.error = 'Ошибка загрузки данных';
        }
      });
    }

    applyFilter() {
      const query = this.searchQuery.trim().toLowerCase();
      this.filteredUsers = this.users.filter(u =>
        u.email.toLowerCase().includes(query)
      );
      this.currentPage = 1;
      
    } 

    get paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredUsers.slice(start, start + this.itemsPerPage);
    }

    getTotalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    }

    nextPage() {
      if (this.currentPage < this.getTotalPages()) {
        this.currentPage++;
      }
    }

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
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

      this.http.delete(`${environment.url}/api/user/${id}`).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.applyFilter(); // Обновляем фильтрацию
        },
        error: (err) => {
          console.error('Ошибка удаления:', err.message);
          this.error = 'Не удалось удалить пользователя';
        }
      });
    }
  }
