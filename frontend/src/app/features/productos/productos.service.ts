import { Injectable, signal } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

export interface Producto {
  id: number;
  nombre: string;
  stock: number;
  precio: number;
  proveedorId: number;
  proveedorNombre?: string; 
}


@Injectable({ providedIn: 'root' })
export class ProductosService {
  productosSig = signal<Producto[]>([]);
  constructor(private api: ApiService) {}

  list() {
    this.api.get<Producto[]>('/api/productos')
      .subscribe(res => this.productosSig.set(res));
  }

  find(id: number) {
    return this.api.get<Producto>(`/api/productos/${id}`);
  }

  create(p: Omit<Producto, 'id'>) {
    return this.api.post<Producto>('/api/productos', p);
  }

  update(p: Producto) {
    return this.api.put<Producto>(`/api/productos/${p.id}`, p);
  }

  remove(id: number) {
    return this.api.delete<void>(`/api/productos/${id}`);
  }
}
