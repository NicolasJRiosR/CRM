import { Injectable, signal } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  fechaRegistro?: string; // ✅ ISO string (ej: "2025-11-26T09:05:45")
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  clientesSig = signal<Cliente[]>([]);
  constructor(private api: ApiService) {}

  list(q?: string) {
    this.api.get<Cliente[]>('/api/clientes', q ? { q } : undefined)
      .subscribe(res => this.clientesSig.set(res));
  }

  find(id: number) {
    return this.api.get<Cliente>(`/api/clientes/${id}`);
  }

  create(c: Omit<Cliente, 'id'>) {
    return this.api.post<Cliente>('/api/clientes', {
      nombre: c.nombre,
      email: c.email,
      telefono: c.telefono,
      fechaRegistro: c.fechaRegistro
    });
  }

  update(c: Cliente) {
    return this.api.put<Cliente>(`/api/clientes/${c.id}`, {
      nombre: c.nombre,
      email: c.email,
      telefono: c.telefono,
      fechaRegistro: c.fechaRegistro
    });
  }

  remove(id: number) {
    return this.api.delete<void>(`/api/clientes/${id}`);
  }
}
