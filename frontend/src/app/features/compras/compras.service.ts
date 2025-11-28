import { Injectable, signal } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

export interface Compra {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  fecha: string;
  proveedorId?: number;
}

@Injectable({ providedIn: 'root' })
export class ComprasService {
  comprasSig = signal<Compra[]>([]);

  constructor(private api: ApiService) {}

  // Listar compras
  list() {
    this.api
      .get<Compra[]>('/api/compras')
      .subscribe((c) => this.comprasSig.set(c));
  }

  // Crear nueva compra
  create(c: Omit<Compra, 'id' | 'fecha'>) {
    return this.api.post<Compra>('/api/compras', {
      productoId: c.productoId,
      cantidad: c.cantidad,
      precioUnitario: c.precioUnitario,
      entidadId: c.proveedorId, // mapear proveedorId → entidadId
    });
  }

  // Actualizar compra existente
  update(c: Compra) {
    return this.api.put<Compra>(`/api/compras/${c.id}`, {
      productoId: c.productoId,
      cantidad: c.cantidad,
      precioUnitario: c.precioUnitario,
      entidadId: c.proveedorId, // mapear proveedorId → entidadId
    });
  }
}

