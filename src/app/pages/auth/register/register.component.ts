import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [ReactiveFormsModule, RouterModule, NgIf]
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';

    if (this.registerForm.valid) {
      const { email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.error = 'Пароли не совпадают.';
      return;
    }

      this.authService.register(email, password).subscribe({
        next: () => {
          this.successMessage = 'Регистрация успешна!';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err: any) => {
        this.error = err.message || 'Ошибка регистрации';
        console.error('Ошибка регистрации:', err.error?.message || err.message);
        }
      });
    }
  }
}