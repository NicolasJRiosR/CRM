import { Injectable, signal } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

export interface Interaccion { 
  id: number; 
  clienteId: number; 
  fechaHora: string;             
  tipo: 'LLAMADA'|'EMAIL'|'REUNION'; 
  descripcion: string;           
}

@Injectable({ providedIn: 'root' })
export class InteraccionesService {
  interaccionesSig = signal<Interaccion[]>([]);
  constructor(private api: ApiService) {}

  list(clienteId?: number) {
    this.api.get<Interaccion[]>('/api/interacciones', clienteId ? { clienteId } : undefined)
      .subscribe(res => this.interaccionesSig.set(res));
  }

  create(i: Omit<Interaccion,'id'>) {
    return this.api.post<Interaccion>('/api/interacciones', {
      clienteId: i.clienteId,
      tipo: i.tipo,
      descripcion: i.descripcion,   
      fechaHora: i.fechaHora      
    });
  }
  update(i: Interaccion) {
  return this.api.put<Interaccion>(`/api/interacciones/${i.id}`, i);
}

}