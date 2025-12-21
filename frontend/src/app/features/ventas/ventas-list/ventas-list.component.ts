import { Component, inject, OnInit } from '@angular/core';
import { VentasService, Venta } from '../ventas.service';
import { ProductosService } from '../../productos/productos.service';  
import { CustomerService } from '../../clientes/customer.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-ventas-list',
  templateUrl: './ventas-list.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class VentasListComponent implements OnInit {
  ventasSvc = inject(VentasService); //aqui se inyecta el servicio de ventas
  productosSvc = inject(ProductosService);
  clientesSvc = inject(CustomerService);
  fb = inject(FormBuilder);
  router = inject(Router);

  //formulario de filtros   
  filtroForm = this.fb.group({
    id: [''],
    fecha: [''],
    producto: [''],
  });

  ventasSig = this.ventasSvc.ventasSig;  //señal q tiene actualizada la lista de ventas
  productosSig = this.productosSvc.productosSig;

  ngOnInit() {
    this.ventasSvc.list();        // Carga todos los datos (ventas) desde el servicio 
    this.productosSvc.list();  

    //Cada vez que el usuario modifica alugn filtros el componente actualiza automáticamente
    this.filtroForm.valueChanges.subscribe((value) => {
      this.appliedFilters = {
        id: value.id ?? '', 
        fecha: value.fecha ?? '',
        producto: value.producto ?? '',
      };
    });
  }

  appliedFilters = { id: '', fecha: '', producto: '' };

  //devuelve las ventas filtradas según los criterios del formulario
  ventasFiltradas() { 
    const { id, fecha, producto } = this.appliedFilters;
    return this.ventasSig().filter((v) => {
      const nombreProducto = this.getNombreProductoDirecto(
        v.productoId,
      ).toLowerCase();

      // Filtro por id
      if (id && !v.id.toString().toLowerCase().includes(id.toLowerCase()))
        return false;

      // Filtro por fecha
      if (fecha && !v.fecha.startsWith(fecha)) return false;

      // Filtro por producto
      if (producto && !nombreProducto.includes(producto.toLowerCase()))
        return false;

      return true; // Si pasa todos los filtros, se muestra
    });
  }

  // Método para limpiar filtros y mostrar todas las ventas
  limpiar() {
    this.filtroForm.reset({ id: '', fecha: '', producto: '' });
    this.appliedFilters = { id: '', fecha: '', producto: '' };
  }

  getNombreProductoDirecto(productoId: number): string {
    const p = this.productosSig().find((x) => x.id === productoId);
    return p?.nombre ?? 'Desconocido';
  }

  trackById(index: number, item: Venta) {
    return item.id;
  }

  // navega al formulario para hacer nueva venta
  nuevaVenta() {
    this.router.navigate(['/ventas/nuevo']);
  }

  // navega al formulario para editar una venta existente
  editarVenta(v: Venta) {
    this.router.navigate(['/ventas', v.id]);
  }
}
