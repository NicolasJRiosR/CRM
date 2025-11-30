import { Component, inject, computed, signal } from '@angular/core';
import { ComprasService, Compra } from './compras.service';
import { ProductosService } from '../productos/productos.service';
import { ProveedoresService } from '../proveedor/ProveedoresService';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-compras',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './compras.component.html',
})
export class ComprasComponent {
  comprasSvc = inject(ComprasService);
  productosSvc = inject(ProductosService);
  proveedoresSvc = inject(ProveedoresService);
  fb = inject(FormBuilder);

  comprasSig = this.comprasSvc.comprasSig;
  productosSig = this.productosSvc.productosSig;
  proveedoresSig = this.proveedoresSvc.proveedoresSig;

  form = this.fb.group({
    productoId: [null as number | null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0.01)]],
    proveedorId: [null as number | null, Validators.required],
  });

  filtroForm = this.fb.group({
    producto: [''],
    proveedor: [''],
    fecha: [''],
  });

  appliedFiltersSig = signal<{
    producto: string;
    proveedor: string;
    fecha: string;
  }>({
    producto: '',
    proveedor: '',
    fecha: '',
  });

  mostrarFormulario = false;
  editandoCompra = false;
  compraEditandoId: number | null = null;

  ngOnInit() {
    this.comprasSvc.list();
    this.productosSvc.list();
    this.proveedoresSvc.list();

    this.filtroForm.valueChanges.subscribe((values) => {
      this.appliedFiltersSig.set({
        producto: values.producto ?? '',
        proveedor: values.proveedor ?? '',
        fecha: values.fecha ?? '',
      });
    });
  }

  comprasFiltradas = computed(() => {
    const filters = this.appliedFiltersSig();
    const prodFiltro = filters.producto.trim().toLowerCase();
    const provFiltro = filters.proveedor.trim().toLowerCase();
    const fechaFiltro = filters.fecha.trim();

    const productosMap = new Map(
      this.productosSig().map((p) => [p.id, p.nombre.toLowerCase()]),
    );

    const proveedoresMap = new Map(
      this.proveedoresSig().map((p) => [p.id, p.nombre.toLowerCase()]),
    );

    return this.comprasSig().filter((c) => {
      const nombreProducto = productosMap.get(c.productoId) ?? '';
      const matchProducto = !prodFiltro || nombreProducto.includes(prodFiltro);

      const nombreProveedor = proveedoresMap.get(c.proveedorId ?? 0) ?? '';
      const matchProveedor =
        !provFiltro || nombreProveedor.includes(provFiltro);

      const fechaCompra = new Date(c.fecha).toISOString().split('T')[0];
      const matchFecha = !fechaFiltro || fechaCompra === fechaFiltro;

      return matchProducto && matchProveedor && matchFecha;
    });
  });

  limpiar() {
    this.filtroForm.reset({ producto: '', proveedor: '', fecha: '' });
    this.appliedFiltersSig.set({ producto: '', proveedor: '', fecha: '' });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.editandoCompra = false;
      this.compraEditandoId = null;
      this.form.reset({
        cantidad: 1,
        precioUnitario: 0,
        proveedorId: null,
      });
    }
  }

  getNombreProductoDirecto(productoId: number) {
    const producto = this.productosSig().find((p) => p.id === productoId);
    return producto ? producto.nombre : 'Desconocido';
  }

  getNombreProveedor(proveedorId?: number) {
    const prov = this.proveedoresSig().find((p) => p.id === proveedorId);
    return prov ? prov.nombre : 'Desconocido';
  }

  getFechaSlash(fecha: string) {
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    const mes = (f.getMonth() + 1).toString().padStart(2, '0');
    const año = f.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  add() {
    if (this.form.invalid) return;

    const compraData: Omit<Compra, 'id' | 'fecha'> = {
      productoId: this.form.value.productoId!,
      cantidad: this.form.value.cantidad!,
      precioUnitario: this.form.value.precioUnitario!,
      proveedorId: this.form.value.proveedorId!,
    };

    this.comprasSvc.create(compraData).subscribe(() => {
      this.comprasSvc.list();
      this.resetForm();
    });
  }

  editarCompra(compra: Compra) {
    this.form.patchValue({
      productoId: compra.productoId,
      cantidad: compra.cantidad,
      precioUnitario: compra.precioUnitario,
      proveedorId: compra.proveedorId ?? null,
    });
    this.compraEditandoId = compra.id;
    this.mostrarFormulario = true;
    this.editandoCompra = true;
  }

  update() {
    if (this.form.invalid || this.compraEditandoId === null) return;

    const compraActualizada: Compra = {
      id: this.compraEditandoId,
      fecha: new Date().toISOString(),
      productoId: this.form.value.productoId!,
      cantidad: this.form.value.cantidad!,
      precioUnitario: this.form.value.precioUnitario!,
      proveedorId: this.form.value.proveedorId!,
    };

    this.comprasSvc.update(compraActualizada).subscribe(() => {
      this.comprasSvc.list();
      this.resetForm();
    });
  }

  private resetForm() {
    this.form.reset({
      cantidad: 1,
      precioUnitario: 0,
      proveedorId: null,
    });
    this.mostrarFormulario = false;
    this.editandoCompra = false;
    this.compraEditandoId = null;
  }

  trackByCompraId(index: number, compra: Compra): number {
    return compra.id;
  }
}
