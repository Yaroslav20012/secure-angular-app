import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of, from } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

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
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private keyUrl = '/api/key/public-key';
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.get(this.keyUrl, { responseType: 'text' }).pipe(
      switchMap((publicKeyPem: string) => {
        return from(this.encryptWithPublicKey(publicKeyPem, email, password));
      }),
      switchMap(({ encryptedEmail, encryptedPassword }) => {
        return this.http.post(`${this.apiUrl}/login`, {
          email: encryptedEmail,
          password: encryptedPassword
        }, { withCredentials: true });
      }),
      tap((response: any) => {
        const user = {
          id: response.id,
          email: response.email,
          token: response.token
        };

        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError((err) => {
        console.error('Ошибка входа:', err.message);
        return throwError(() => new Error('Не удалось войти'));
      })
    );
  }

  register(email: string, password: string): Observable<any> {
    return this.http.get(this.keyUrl, { responseType: 'text' }).pipe(
      switchMap((publicKeyPem: string) => {
        return from(this.encryptWithPublicKey(publicKeyPem, email, password));
      }),
      switchMap(({ encryptedEmail, encryptedPassword }) => {
        return this.http.post(`${this.apiUrl}/register`, {
          email: encryptedEmail,
          password: encryptedPassword
        });
      }),
      tap(() => {
        console.log('Регистрация успешна');
      }),
      catchError((err) => {
        console.error('Ошибка регистрации:', err.message);
        return throwError(() => new Error('Не удалось зарегистрироваться'));
      })
    );
  }

  // ✅ Реализация RSA-OAEP шифрования
    private async encryptWithPublicKey(publicKeyPem: string, email: string, password: string) {
      try {
        const publicKey = await this.importPublicKey(publicKeyPem);

        const encryptData = async (key: CryptoKey, data: string): Promise<string> => {
          const encoder = new TextEncoder();
          const encrypted = await window.crypto.subtle.encrypt(
            { name: 'RSA-OAEP', hash: {name: 'SHA-256'} } as AlgorithmIdentifier,
            key,
            encoder.encode(data)
          );

          return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
        };

        const [encryptedEmail, encryptedPassword] = await Promise.all([
          encryptData(publicKey, email),
          encryptData(publicKey, password)
        ]);

        return { encryptedEmail, encryptedPassword };
      } catch (e) {
        const error = e as Error;
        console.error('Ошибка шифрования:', error.message);
        throw new Error('Не удалось зашифровать данные');
      }
    }

  private async importPublicKey(publicKeyPem: string): Promise<CryptoKey> {
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';

    const pemContents = publicKeyPem
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s+/g, '');

    const binaryDerString = window.atob(pemContents);
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
    this.http.post('/api/auth/logout', {}, { withCredentials: true }).subscribe({
      next: () => {
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }
    });
  }

  getNewAccessToken(): Observable<any> {
    return this.http.post('/api/auth/refresh', {}, { withCredentials: true }).pipe(
      tap((response: any) => {
        const currentUser = this.getCurrentUser();
        if (currentUser && response.accessToken) {
          currentUser.token = response.accessToken;
          localStorage.setItem('user', JSON.stringify(currentUser));
          this.currentUserSubject.next(currentUser);
        }
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return throwError(() => new Error('Не удалось обновить токен'));
      })
    );
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!user?.token;
  }
}