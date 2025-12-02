import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}


  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  get<T>(url: string, params?: any) {
    return this.http.get<T>(`${this.base}${url}`, {
      headers: this.getHeaders(),
      params
    });
  }

  post<T>(url: string, body: unknown) {
    return this.http.post<T>(`${this.base}${url}`, body, {
      headers: this.getHeaders()
    });
  }

  put<T>(url: string, body: unknown) {
    return this.http.put<T>(`${this.base}${url}`, body, {
      headers: this.getHeaders()
    });
  }

  delete<T>(url: string) {
    return this.http.delete<T>(`${this.base}${url}`, {
      headers: this.getHeaders()
    });
  }
}
