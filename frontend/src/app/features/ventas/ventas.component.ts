import { Component, inject, computed, effect, signal } from '@angular/core';
import { VentasService, Venta } from './ventas.service';
import { ProductosService } from '../productos/productos.service';
import { CustomerService } from '../clientes/customer.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-ventas',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ventas.component.html',
})
export class VentasComponent {
  ventasSvc = inject(VentasService);
  productosSvc = inject(ProductosService);
  clientesSvc = inject(CustomerService);
  fb = inject(FormBuilder);

  clientesSig = this.clientesSvc.clientesSig;
  productosSig = this.productosSvc.productosSig;
  ventasSig = this.ventasSvc.ventasSig;

  form = this.fb.group({
    id: [null as number | null],
    productoId: [null as number | null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0.01)]],
    clienteId: [null as number | null],
  });

  filtroForm = this.fb.group({
    id: [''],
    fecha: [''],
    producto: [''],
  });

  appliedFiltersSig = signal<{ id: string; fecha: string; producto: string }>({
    id: '',
    fecha: '',
    producto: '',
  });

  productoMap: Record<number, string> = {};

  editandoVenta = false;
  mostrarFormulario = false;

  productosEffect = effect(() => {
    const productos = this.productosSig();
    this.productoMap = {};
    productos.forEach((p) => {
      this.productoMap[p.id] = p.nombre;
    });
  });

  ngOnInit() {
    this.ventasSvc.list();
    this.productosSvc.list();
    this.clientesSvc.list();

    // Aplicar filtros automáticamente al cambiar cualquier campo del filtro
    this.filtroForm.valueChanges.subscribe((values) => {
      this.appliedFiltersSig.set({
        id: (values.id ?? '').toString(),
        fecha: values.fecha ?? '',
        producto: values.producto ?? '',
      });
    });
  }

  ventasFiltradas = computed(() => {
    const filters = this.appliedFiltersSig();
    const idFiltro = filters.id.trim().toLowerCase();
    const fechaFiltro = filters.fecha.trim();
    const prodFiltro = filters.producto.trim().toLowerCase();

    return this.ventasSig().filter((v) => {
      const matchId =
        !idFiltro || v.id.toString().toLowerCase().includes(idFiltro);
      const matchFecha = !fechaFiltro || v.fecha.startsWith(fechaFiltro);
      const nombreProducto = this.getNombreProductoDirecto(
        v.productoId,
      ).toLowerCase();
      const matchProducto = !prodFiltro || nombreProducto.includes(prodFiltro);
      return matchId && matchFecha && matchProducto;
    });
  });

  filtrar() {
    const { id, fecha, producto } = this.filtroForm.value;
    this.appliedFiltersSig.set({
      id: (id ?? '').toString(),
      fecha: fecha ?? '',
      producto: producto ?? '',
    });
  }

  limpiar() {
    this.filtroForm.reset({ id: '', fecha: '', producto: '' });
    this.appliedFiltersSig.set({ id: '', fecha: '', producto: '' });
  }

  getNombreProductoDirecto(productoId: number): string {
    const producto = this.productosSig().find((p) => p.id === productoId);
    return producto?.nombre ?? 'Desconocido';
  }

  getFechaSlash(fecha: string): string {
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    const mes = (f.getMonth() + 1).toString().padStart(2, '0');
    const año = f.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  // ------------------------------------------------
  // NUEVA VENTA
  // ------------------------------------------------
  add() {
    if (this.form.invalid) return;

    const venta = this.form.value as Venta;

    this.ventasSvc.create(venta).subscribe(() => {
      console.log('Venta creada ✅');
      this.ventasSvc.list();
      this.form.reset({ cantidad: 1, precioUnitario: 0, clienteId: null });
      this.mostrarFormulario = false;
    });
  }

  // ------------------------------------------------
  // MODIFICAR VENTA
  // ------------------------------------------------
  update() {
    if (this.form.invalid) return;

    const formData = this.form.value as Venta;

    if (!formData.id) return;

    const original = this.ventasSig().find((v) => v.id === formData.id);
    if (!original) return;

    const ventaActualizada: Venta = {
      ...original, // mantiene fecha, id, etc
      ...formData, // actualiza solo lo editable
    };

    this.ventasSvc.update(ventaActualizada).subscribe({
      next: () => {
        console.log('Venta actualizada');
        this.ventasSvc.list();
        this.form.reset({ cantidad: 1, precioUnitario: 0, clienteId: null });
        this.editandoVenta = false;
        this.mostrarFormulario = false;
      },
      error: (e) => console.error('PUT ERROR', e),
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.editandoVenta = false;
      this.form.reset({ cantidad: 1, precioUnitario: 0, clienteId: null });
    }
  }

  editarVenta(venta: Venta) {
    this.form.patchValue({
      id: venta.id,
      productoId: venta.productoId,
      cantidad: venta.cantidad,
      precioUnitario: venta.precioUnitario,
      clienteId: venta.clienteId ?? null,
    });

    this.mostrarFormulario = true;
    this.editandoVenta = true;
  }
}
