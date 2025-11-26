import { Injectable, signal } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  proveedoresSig = signal<Proveedor[]>([]);

  constructor(private api: ApiService) {}

  list() {
    this.api.get<Proveedor[]>('/api/proveedores')
      .subscribe(res => this.proveedoresSig.set(res));
  }

  find(id: number) {
    return this.api.get<Proveedor>(`/api/proveedores/${id}`);
  }

  create(p: Omit<Proveedor, 'id'>) {
    return this.api.post<Proveedor>('/api/proveedores', p);
  }

  update(p: Proveedor) {
    return this.api.put<Proveedor>(`/api/proveedores/${p.id}`, p);
  }

  remove(id: number) {
    return this.api.delete<void>(`/api/proveedores/${id}`);
  }
}
