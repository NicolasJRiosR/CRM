import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface User { id: number; username: string; roles: string[]; }
export interface LoginResponse { token: string; user: User; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = environment.jwtStorageKey;
  tokenSig = signal<string | null>(null);
  userSig = signal<User | null>(null);

  constructor(private http: HttpClient) {
    const t = sessionStorage.getItem(this.key);
    if (t) this.tokenSig.set(t);
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/api/auth/login`, { username, password });
  }

  setSession(res: LoginResponse) {
    sessionStorage.setItem(this.key, res.token);
    this.tokenSig.set(res.token);
    this.userSig.set(res.user);
  }

  logout() {
    sessionStorage.removeItem(this.key);
    this.tokenSig.set(null);
    this.userSig.set(null);
  }

  isAuthenticated() { return !!this.tokenSig(); }
}
