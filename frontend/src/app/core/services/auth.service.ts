import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';


export interface User { id: number; username: string; roles: string[]; }
export interface LoginResponse { token: string; }

export interface JwtPayload {
  sub: string;
  roles: string[];
  exp: number;
  iat: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = environment.jwtStorageKey;
  tokenSig = signal<string | null>(null);
  userSig = signal<User | null>(null);

  constructor(private http: HttpClient) {
    const t = sessionStorage.getItem(this.key);
    if (t) {
      this.tokenSig.set(t);
      this.decodeAndSetUser(t);
    }
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(
      `${environment.apiBaseUrl}/api/auth/login`,
      { username, password }
    );
  }

  setSession(res: LoginResponse) {
    sessionStorage.setItem(this.key, res.token);
    this.tokenSig.set(res.token);
    this.decodeAndSetUser(res.token);
  }

  private decodeAndSetUser(token: string) {
   
    const payload = jwtDecode<JwtPayload>(token);

    this.userSig.set({
      id: 0,
      username: payload.sub,
      roles: payload.roles,
    });
  }

  logout() {
    sessionStorage.removeItem(this.key);
    this.tokenSig.set(null);
    this.userSig.set(null);
  }

  isAuthenticated() {
    return !!this.tokenSig();
  }
}
