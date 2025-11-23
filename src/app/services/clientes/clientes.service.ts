import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cliente {
  id?: string;
  nombre: string;
  correo: string;
  telefono: string;
  edad?: number;
  ubicacion?: string;
  historial?: string;
  fechaAlta: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  constructor(private http: HttpClient) {}

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>('/api/clientes'); 
    // Cambia la URL por la de tu backend real
  }

  crearCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>('/api/clientes', cliente);
  }

  getClienteById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`/api/clientes/${id}`);
  }

  actualizarCliente(id: string, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`/api/clientes/${id}`, cliente);
  }

  eliminarCliente(id: string): Observable<void> {
    return this.http.delete<void>(`/api/clientes/${id}`);
  }
}
