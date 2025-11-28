import { Component, inject, computed, signal } from '@angular/core';
import { ComprasService, Compra } from './compras.service';
import { ProductosService } from '../productos/productos.service';
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
  fb = inject(FormBuilder);

  comprasSig = this.comprasSvc.comprasSig;
  productosSig = this.productosSvc.productosSig;

  // Formulario principal
  form = this.fb.group({
    productoId: [null as number | null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0.01)]],
    proveedorId: [undefined as number | undefined],
  });

  // Filtros
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
  }

  // Filtrado
  comprasFiltradas = computed(() => {
    const filters = this.appliedFiltersSig();
    const prodFiltro = filters.producto.trim().toLowerCase();
    const provFiltro = filters.proveedor.trim().toLowerCase();
    const fechaFiltro = filters.fecha.trim();

    return this.comprasSig().filter((c) => {
      const producto = this.productosSig().find((p) => p.id === c.productoId);
      const nombreProducto = producto ? producto.nombre.toLowerCase() : '';

      const matchProducto = !prodFiltro || nombreProducto.includes(prodFiltro);
      const matchProveedor =
        !provFiltro ||
        (c.proveedorId?.toString() ?? '').toLowerCase().includes(provFiltro);

      const fechaCompra = new Date(c.fecha).toISOString().split('T')[0];
      const matchFecha = !fechaFiltro || fechaCompra === fechaFiltro;

      return matchProducto && matchProveedor && matchFecha;
    });
  });

  filtrar() {
    const { producto, proveedor, fecha } = this.filtroForm.value;
    this.appliedFiltersSig.set({
      producto: producto ?? '',
      proveedor: proveedor ?? '',
      fecha: fecha ?? '',
    });
  }

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
        proveedorId: undefined,
      });
    }
  }

  getNombreProductoDirecto(productoId: number) {
    const producto = this.productosSig().find((p) => p.id === productoId);
    return producto ? producto.nombre : 'Desconocido';
  }

  getFechaSlash(fecha: string) {
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    const mes = (f.getMonth() + 1).toString().padStart(2, '0');
    const año = f.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  // ------------------------------------------------
  // NUEVA COMPRA
  // ------------------------------------------------
  add() {
    if (this.form.invalid) return;

    const compraData: Omit<Compra, 'id' | 'fecha'> = {
      productoId: this.form.value.productoId!,
      cantidad: this.form.value.cantidad!,
      precioUnitario: this.form.value.precioUnitario!,
      proveedorId: this.form.value.proveedorId ?? undefined,
    };

    this.comprasSvc.create(compraData).subscribe(() => {
      this.comprasSvc.list();
      this.resetForm();
    });
  }

  // ------------------------------------------------
  // EDITAR COMPRA
  // ------------------------------------------------
  editarCompra(compra: Compra) {
    this.form.patchValue({
      productoId: compra.productoId,
      cantidad: compra.cantidad,
      precioUnitario: compra.precioUnitario,
      proveedorId: compra.proveedorId ?? undefined,
    });
    this.compraEditandoId = compra.id;
    this.mostrarFormulario = true;
    this.editandoCompra = true;
  }

  update() {
    if (this.form.invalid || this.compraEditandoId === null) return;

    const compraActualizada: Compra = {
      id: this.compraEditandoId,
      fecha: new Date().toISOString(), // o mantener la original si tu backend lo requiere
      productoId: this.form.value.productoId!,
      cantidad: this.form.value.cantidad!,
      precioUnitario: this.form.value.precioUnitario!,
      proveedorId: this.form.value.proveedorId ?? undefined,
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
      proveedorId: undefined,
    });
    this.mostrarFormulario = false;
    this.editandoCompra = false;
    this.compraEditandoId = null;
  }
}
