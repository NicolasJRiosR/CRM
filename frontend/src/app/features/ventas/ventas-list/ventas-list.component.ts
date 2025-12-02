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
  ventasSvc = inject(VentasService);
  productosSvc = inject(ProductosService);
  clientesSvc = inject(CustomerService);
  fb = inject(FormBuilder);
  router = inject(Router);

  filtroForm = this.fb.group({
    id: [''],
    fecha: [''],
    producto: [''],
  });

  ventasSig = this.ventasSvc.ventasSig;
  productosSig = this.productosSvc.productosSig;

  ngOnInit() {
    this.ventasSvc.list();
    this.productosSvc.list();

    this.filtroForm.valueChanges.subscribe((value) => {
      this.appliedFilters = {
        id: value.id ?? '',
        fecha: value.fecha ?? '',
        producto: value.producto ?? '',
      };
    });
  }

  appliedFilters = { id: '', fecha: '', producto: '' };

  ventasFiltradas() {
    const { id, fecha, producto } = this.appliedFilters;
    return this.ventasSig().filter((v) => {
      const nombreProducto = this.getNombreProductoDirecto(
        v.productoId,
      ).toLowerCase();
      if (id && !v.id.toString().toLowerCase().includes(id.toLowerCase()))
        return false;
      if (fecha && !v.fecha.startsWith(fecha)) return false;
      if (producto && !nombreProducto.includes(producto.toLowerCase()))
        return false;
      return true;
    });
  }

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

  // Navegación
  nuevaVenta() {
    this.router.navigate(['/ventas/nuevo']);
  }

  editarVenta(v: Venta) {
    this.router.navigate(['/ventas', v.id]);
  }
}
