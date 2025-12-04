import { Component, inject, signal, computed } from '@angular/core';
import { ProductosService, Producto } from '../productos.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-productos-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './productos-list.component.html',
})
export class ProductosListComponent {
  svc = inject(ProductosService);
  router = inject(Router);
  fb = inject(FormBuilder);

  filtroForm = this.fb.group({
    id: [''],
    nombre: [''],
    proveedor: [''],
    stockCategoria: [''],
  });

  appliedFiltersSig = signal<{
    id: string;
    nombre: string;
    proveedor: string;
    stockCategoria: string;
  }>({
    id: '',
    nombre: '',
    proveedor: '',
    stockCategoria: '',
  });

  productosFiltrados = computed(() => {
    const filters = this.appliedFiltersSig();
    const idFiltro = filters.id.trim().toLowerCase();
    const nombreFiltro = filters.nombre.trim().toLowerCase();
    const proveedorFiltro = filters.proveedor.trim().toLowerCase();
    const stockCategoria = filters.stockCategoria.trim();

    return this.svc.productosSig().filter((p: Producto) => {
      const matchId =
        !idFiltro || p.id.toString().toLowerCase().includes(idFiltro);
      const matchNombre =
        !nombreFiltro || p.nombre.toLowerCase().includes(nombreFiltro);
      const matchProveedor =
        !proveedorFiltro ||
        (p.proveedorNombre ?? '').toLowerCase().includes(proveedorFiltro);

      let matchStock = true;
      if (stockCategoria) {
        if (stockCategoria === 'SIN_STOCK') matchStock = p.stock <= 0;
        else if (stockCategoria === 'CRITICO')
          matchStock = p.stock >= 1 && p.stock <= 10;
        else if (stockCategoria === 'BAJO')
          matchStock = p.stock > 10 && p.stock <= 50;
        else if (stockCategoria === 'DISPONIBLE') matchStock = p.stock > 50;
      }

      return matchId && matchNombre && matchProveedor && matchStock;
    });
  });

  ngOnInit() {
    this.svc.list();

    this.filtroForm.valueChanges.subscribe(
      ({ id, nombre, proveedor, stockCategoria }) => {
        this.appliedFiltersSig.set({
          id: (id ?? '').toString(),
          nombre: nombre ?? '',
          proveedor: proveedor ?? '',
          stockCategoria: stockCategoria ?? '',
        });
      },
    );
  }

  limpiar() {
    this.filtroForm.reset({
      id: '',
      nombre: '',
      proveedor: '',
      stockCategoria: '',
    });
    this.appliedFiltersSig.set({
      id: '',
      nombre: '',
      proveedor: '',
      stockCategoria: '',
    });
  }
}
