import { Injectable, signal } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

export interface Interaccion { id: number; clienteId: number; fecha: string; tipo: 'LLAMADA'|'EMAIL'|'REUNION'; nota: string; }

@Injectable({ providedIn: 'root' })
export class InteraccionesService {
  interaccionesSig = signal<Interaccion[]>([]);
  constructor(private api: ApiService) {}
  list(clienteId?: number) {
    this.api.get<Interaccion[]>('/api/interacciones', clienteId ? { clienteId } : undefined)
      .subscribe(res => this.interaccionesSig.set(res));
  }
  create(i: Omit<Interaccion,'id'>) { return this.api.post<Interaccion>('/api/interacciones', i); }
}
