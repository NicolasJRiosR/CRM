import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ComprasService, Compra } from '../compras.service';
import { ProductosService } from '../../productos/productos.service';
import { ProveedoresService } from '../../proveedor/ProveedoresService';

@Component({
  standalone: true,
  selector: 'app-compras-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './compras-list.component.html',
})
export class ComprasListComponent {
  router = inject(Router);
  fb = inject(FormBuilder);

  comprasSvc = inject(ComprasService);
  productosSvc = inject(ProductosService);
  proveedoresSvc = inject(ProveedoresService);

  filtroForm = this.fb.group({
    producto: [''],
    proveedor: [''],
    fecha: [''],
  });

  appliedFiltersSig = signal({
    producto: '',
    proveedor: '',
    fecha: '',
  });

  comprasSig = this.comprasSvc.comprasSig;
  productosSig = this.productosSvc.productosSig;
  proveedoresSig = this.proveedoresSvc.proveedoresSig;

  ngOnInit() {
    this.comprasSvc.list();
    this.productosSvc.list();
    this.proveedoresSvc.list();

    this.filtroForm.valueChanges.subscribe(({ producto, proveedor, fecha }) => {
      this.appliedFiltersSig.set({
        producto: producto ?? '',
        proveedor: proveedor ?? '',
        fecha: fecha ?? '',
      });
    });
  }

  comprasFiltradas = computed(() => {
    const filters = this.appliedFiltersSig();

    const productoFiltro = filters.producto.trim().toLowerCase();
    const proveedorFiltro = filters.proveedor.trim().toLowerCase();
    const fechaFiltro = filters.fecha.trim();

    const productosMap = new Map(
      this.productosSig().map((p) => [p.id, p.nombre.toLowerCase()]),
    );

    const proveedoresMap = new Map(
      this.proveedoresSig().map((p) => [p.id, p.nombre.toLowerCase()]),
    );

    return this.comprasSig().filter((c) => {
      const nombreProducto = productosMap.get(c.productoId) ?? '';
      const matchProducto =
        !productoFiltro || nombreProducto.includes(productoFiltro);

      const nombreProveedor = proveedoresMap.get(c.proveedorId ?? 0) ?? '';
      const matchProveedor =
        !proveedorFiltro || nombreProveedor.includes(proveedorFiltro);

      const fechaCompra = new Date(c.fecha).toISOString().split('T')[0];
      const matchFecha = !fechaFiltro || fechaCompra === fechaFiltro;

      return matchProducto && matchProveedor && matchFecha;
    });
  });

  limpiar() {
    this.filtroForm.reset({
      producto: '',
      proveedor: '',
      fecha: '',
    });

    this.appliedFiltersSig.set({
      producto: '',
      proveedor: '',
      fecha: '',
    });
  }

  getNombreProductoDirecto(productoId: number) {
    const prod = this.productosSig().find((p) => p.id === productoId);
    return prod ? prod.nombre : 'Desconocido';
  }

  getNombreProveedor(proveedorId?: number) {
    const prov = this.proveedoresSig().find((p) => p.id === proveedorId);
    return prov ? prov.nombre : 'Desconocido';
  }

  getFechaSlash(fecha: string) {
    const f = new Date(fecha);
    const d = f.getDate().toString().padStart(2, '0');
    const m = (f.getMonth() + 1).toString().padStart(2, '0');
    const y = f.getFullYear();
    return `${d}/${m}/${y}`;
  }

  trackByCompraId(index: number, compra: Compra) {
    return compra.id;
  }
}
