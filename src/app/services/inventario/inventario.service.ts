import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id?: string;
  jugador: string;
  equipo: string;
  anio: string;
  talla: string;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  constructor(private http: HttpClient) {}

  getInventario(): Observable<Producto[]> {
    return this.http.get<Producto[]>('/api/inventario'); //hay que poner el de verdad, el nuestro vaya
  }
}
