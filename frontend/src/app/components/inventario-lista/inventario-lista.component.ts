import { Component, OnInit } from '@angular/core';
import { InventarioService, Producto } from '../../services/inventario.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-inventario-lista',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './inventario-lista.component.html',
  styleUrls: ['./inventario-lista.component.css']
})
export class InventarioListaComponent implements OnInit {
  productos: Producto[] = [];
  cargando = true;

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.inventarioService.getInventario().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar inventario', err);
        this.cargando = false;
      }
    });
  }

  trackById(index: number, producto: Producto): number {
    return producto.id;
  }
}
