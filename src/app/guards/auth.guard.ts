import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    return Date.now() >= exp * 1000; // преобразуем в миллисекунды
  } catch {
    return true; // повреждённый токен считаем истёкшим
  }
}


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    router.navigate(['/login']);
  }
  
  if (currentUser?.token && !isTokenExpired(currentUser.token)) {
    console.log("AuthGuard its's work")
    return true;
  }

  return authService.getNewAccessToken().pipe(
    map(() => {
      const user = authService.getCurrentUser();
      return !isTokenExpired(user?.token) ? true : router.parseUrl('/login');
    }),
    catchError((err) => of(router.parseUrl('/login')))
  );
};
