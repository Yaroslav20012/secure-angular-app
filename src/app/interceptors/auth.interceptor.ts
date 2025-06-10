import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  try {  
  console.log('🧾 Interceptor вызван'); // ✅ Этот лог должен появиться
  const authService = inject(AuthService);
  const currentUser = authService.getCurrentUser();      
    if (currentUser?.token && !isTokenExpired(currentUser.token)) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
    }
    return next(req);
  } catch (e) {
    const err = e as Error;
    console.error("Ошибка в интерсепторе: ", err.message);
    return throwError(() => err);
  }
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    return Date.now() >= exp * 1000; // преобразуем в миллисекунды
  } catch {
    return true; // повреждённый токен считаем истёкшим
  }
}