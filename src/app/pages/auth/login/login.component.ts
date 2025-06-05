import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, RouterModule]
})
export class LoginComponent {

  loginForm: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.error = '';
    try{
      
      if (this.loginForm.valid) {
        const { email, password } = this.loginForm.value;    
        this.authService.login(email, password).subscribe({
          next: () => {
            console.log('Вход выполнен');
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Ошибка входа:', err);
            this.error = 'Неверный email или пароль';          
          }
        });
      }else {
        this.error='Форма не валидна'
      }
    }catch (e) {
      const err = e as Error;
      console.error('💥 Ошибка onLogin:', err.message);
      this.error = 'Внутренняя ошибка';
    }
  }
}