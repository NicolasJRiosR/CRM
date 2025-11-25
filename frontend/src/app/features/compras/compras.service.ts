import { Injectable, signal } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

export interface Compra { id: number; productoId: number; cantidad: number; costoUnitario: number; fecha: string; proveedorId?: number; }

@Injectable({ providedIn: 'root' })
export class ComprasService {
  comprasSig = signal<Compra[]>([]);
  constructor(private api: ApiService) {}
  list() { this.api.get<Compra[]>('/api/compras').subscribe(c => this.comprasSig.set(c)); }
  create(c: Omit<Compra,'id'|'fecha'>) { return this.api.post<Compra>('/api/compras', c); }
}
