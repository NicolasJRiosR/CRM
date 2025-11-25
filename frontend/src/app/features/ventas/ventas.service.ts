import { Injectable, signal } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

export interface Venta { id: number; productoId: number; cantidad: number; precioUnitario: number; fecha: string; clienteId?: number; }

@Injectable({ providedIn: 'root' })
export class VentasService {
  ventasSig = signal<Venta[]>([]);
  constructor(private api: ApiService) {}
  list() { this.api.get<Venta[]>('/api/ventas').subscribe(v => this.ventasSig.set(v)); }
  create(v: Omit<Venta,'id'|'fecha'>) { return this.api.post<Venta>('/api/ventas', v); }
}
