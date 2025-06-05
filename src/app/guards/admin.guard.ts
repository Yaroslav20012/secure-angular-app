import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  if (currentUser.role !== 'admin') {
    console.log("Вошёл админ")
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};