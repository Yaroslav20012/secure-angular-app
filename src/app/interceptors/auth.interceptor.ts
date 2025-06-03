import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // const authService = inject(AuthService);
  // const user = authService.getCurrentUser();

  // if (user && user.token) {
  //   const clonedReq = req.clone({
  //     headers: req.headers
  //       .set('Authorization', `Bearer ${user.token}`)
  //       .set('Content-Type', 'application/json')
  //   });
  //   return next(clonedReq);
  // }

  // return next(req);
  const authService = inject(AuthService);
  const user = authService.getCurrentUser();
  //user?.token
  if (user?.token) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${user.token}`)
    });

    return next(req);  
  }
  
  
  return authService.getNewAccessToken().pipe(
    switchMap(() => {
      const currentUser = authService.getCurrentUser();
      if (currentUser?.token) {
        req = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${currentUser.token}`)
        });
      }
      return next(req);
    })
  );
};