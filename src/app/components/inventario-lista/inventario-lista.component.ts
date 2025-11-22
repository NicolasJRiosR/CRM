import { Component, OnInit } from '@angular/core';
import { InventarioService, Producto } from '../../services/inventario.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-inventario-lista',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './inventario-lista.component.html',
  styleUrl: './inventario-lista.component.css'
})

export class InventarioListaComponent implements OnInit {
  productos: Producto[] = [];

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.inventarioService.getInventario().subscribe(data => {
      this.productos = data;
    });
  }
}
