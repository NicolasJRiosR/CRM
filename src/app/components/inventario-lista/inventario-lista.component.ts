import { Component, OnInit } from '@angular/core';
import { InventarioService, Producto } from '../../services/inventario/inventario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario-lista.component.html',
  styleUrl: './inventario-lista.component.css'
})

export class InventarioListaComponent implements OnInit {
  productos: Producto[] = [];

  constructor(private inventarioService: InventarioService) {}

  // ngOnInit(): void {
  //   this.inventarioService.getInventario().subscribe(data => {
  //     this.productos = data;
  //   });
  // }
  ngOnInit(): void {
  this.productos = [
    {
      jugador: 'Magic Johnson',
      equipo: 'Los Angeles Lakers',
      anio: "1984-85",
      talla: 'XL',
      stock: 2
    },
    {
      jugador: 'Dennis Rodman',
      equipo: 'Chicago Bulls',
      anio: "1994-95",
      talla: 'L',
      stock: 1
    }
  ];
}

}
