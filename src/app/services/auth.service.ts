import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import DOMPurify from 'dompurify';
import { environment } from '../../environments/environment';


export interface User {
  id: number;
  email: string;
  token: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private currentUserSubject = new BehaviorSubject<any>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private keyUrl = environment.url + '/api/key/public-key';
  private apiUrl = environment.url + '/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.get(this.keyUrl, { responseType: 'text' }).pipe(
      switchMap(publicKeyPem => this.encryptWithPublicKey(publicKeyPem, email, password)),
      switchMap(({ encryptedEmail, encryptedPassword }) => {
        
        console.log('📧 Зашифрованный email:', encryptedEmail);
        console.log('🔐 Зашифрованный пароль:', encryptedPassword);


        return this.http.post(`${this.apiUrl}/login`, {
          email: encryptedEmail,
          password: encryptedPassword
        }, { withCredentials: true });
      }),
      tap((response: any) => {


        console.log('✅ Ответ от сервера:', response);


        const sanitizedUser = { // изначально было user
          id: Number(response.id),
          email: DOMPurify.sanitize(response.email),//response.email,
          token: response.token,
          refreshToken: response.refreshToken,
          role: response.role || 'user'
        };


        console.log('💾 Сохраняем пользователя в localStorage:', sanitizedUser);


        localStorage.setItem('user', JSON.stringify(sanitizedUser));
        this.currentUserSubject.next(sanitizedUser);

        console.log('✅ Сохранённый пользователь:', sanitizedUser);
        
      }),
      catchError(err => {
        //console.error('Ошибка входа:', err.message);
        return throwError(() => new Error('Не удалось войти'));
      })
    );
  }

  register(email: string, password: string): Observable<any> {   
    return this.http.get(this.keyUrl, { responseType: 'text' }).pipe(
      switchMap(publicKeyPem => this.encryptWithPublicKey(publicKeyPem, email, password)),
      switchMap(({ encryptedEmail, encryptedPassword }) => {
        return this.http.post(`${this.apiUrl}/register`, {
          email: encryptedEmail,
          password: encryptedPassword
        }, { withCredentials: true });
      }),
      tap((response: any) => {
        const user = {
          id: response.id,
          email: response.email,
          token: response.token,
          role: response.role 
        };

        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(err => {

        let errorMessage = 'Не удалось зарегистрироваться';

        if (err.status === 400 && err.error?.message) {
          errorMessage = err.error.message; // Например: "Пользователь с таким email уже существует"
        } else if (err.status === 500) {
          errorMessage = 'Внутренняя ошибка сервера';
        }
        //console.error('Ошибка регистрации:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  encryptWithPublicKey(publicKeyPem: string, email: string, password: string): Promise<{ encryptedEmail: string; encryptedPassword: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const publicKey = await this.importPublicKey(publicKeyPem);
        const encoder = new TextEncoder();

        const encrypt = async (key: CryptoKey, data: string): Promise<string> => {
          const encrypted = await window.crypto.subtle.encrypt(
            { name: 'RSA-OAEP'},
            // publicKey,
            key,
            encoder.encode(data)
          );

          return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
        };

        const [encryptedEmail, encryptedPassword] = await Promise.all([
          encrypt(publicKey, email),
          encrypt(publicKey, password)
        ]);

        resolve({ encryptedEmail, encryptedPassword });
      } catch (e) {
        const error = e as Error;
        //console.error('Ошибка шифрования:', error.message);
        reject(new Error('Не удалось зашифровать данные'));
      }
    });
  }

  private async importPublicKey(publicKeyPem: string): Promise<CryptoKey> {
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';

    const pemContents = publicKeyPem
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');

    const binaryDerString = atob(pemContents);
    const binaryDer = Uint8Array.from(binaryDerString, c => c.charCodeAt(0)).buffer;

    return window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );
  }

  logout(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);    
  }

  getNewAccessToken(): Observable<any> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('Пользователь не найден'));
    }

    return this.http.post('/api/auth/refresh', {}, {
      headers: {
        'x-refresh-token': currentUser.refreshToken
      },
      withCredentials: true
    }).pipe(
      map((response: any) => {
        const updatedUser = {
          ...currentUser,
          token: response.accessToken
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
        return updatedUser;
      }),
      catchError(err => {
        //console.error('🔄 Не удалось обновить токен:', err.message);
        this.router.navigate(['/login']);
        return throwError(() => new Error('Сессия истекла'));
      })
    );
  }

  getCurrentUser(): any {

    const userJson = localStorage.getItem('user');
    if (!userJson) return null;


    try {
      const user = JSON.parse(userJson);
      // Очищаем email от возможных скриптов
      if (user.email && user) {
        user.email = DOMPurify.sanitize(user.email);
      }
      return user;
    } catch (e) {
      const err = e as Error
      console.error('❌ Ошибка чтения пользователя:', err.message);
      return null;
    }
    }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser()?.token;
  }
}