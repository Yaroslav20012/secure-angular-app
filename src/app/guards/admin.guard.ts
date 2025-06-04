import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AdminGuard {//implements CanActivate {
}

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    router.navigate(['/dashboard']);
    return false;
  }

  if (currentUser.role !== 'admin') {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
