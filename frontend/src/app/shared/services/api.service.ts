import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}
  get<T>(url: string, params?: any) { return this.http.get<T>(`${this.base}${url}`, { params }); }
  post<T>(url: string, body: unknown) { return this.http.post<T>(`${this.base}${url}`, body); }
  put<T>(url: string, body: unknown) { return this.http.put<T>(`${this.base}${url}`, body); }
  delete<T>(url: string) { return this.http.delete<T>(`${this.base}${url}`); }
}
