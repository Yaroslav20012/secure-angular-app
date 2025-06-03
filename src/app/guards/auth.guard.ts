import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {//implements CanActivate {

  constructor(private authService: AuthService) {}
  // , private router: Router был вынесен | сверху 
  canActivate(): boolean {
    const user = this.authService.getCurrentUser();
    return !!user?.token;
    // user && user.token
    // if (user?.token) {
    //   return true;
    // }

    // // Если нет токена → пытаемся обновить через Refresh Token
    // this.authService.getNewAccessToken().subscribe({
    //   next: () => {},
    //   error: () => {
    //     this.authService.logout();
    //   }
    // });

    // return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  if (user?.token) return true;

  return authService.getNewAccessToken().pipe(
    map(() => {
      const currentUser = authService.getCurrentUser();
      return !!currentUser?.token;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
