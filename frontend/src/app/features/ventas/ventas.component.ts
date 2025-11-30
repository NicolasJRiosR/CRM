import { Component, inject, computed, effect, signal } from '@angular/core';
import { VentasService, Venta } from './ventas.service';
import { ProductosService } from '../productos/productos.service';
import { CustomerService } from '../clientes/customer.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../shared/services/metrics.service';

@Component({
  standalone: true,
  selector: 'app-ventas',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ventas.component.html',
})
export class VentasComponent {
  constructor(private metricsSvc: MetricsService) {}

  ventasSvc = inject(VentasService);
  productosSvc = inject(ProductosService);
  clientesSvc = inject(CustomerService);
  fb = inject(FormBuilder);

  clientesSig = this.clientesSvc.clientesSig;
  productosSig = this.productosSvc.productosSig;
  ventasSig = this.ventasSvc.ventasSig;

  
  productosDisponibles = computed(() => this.productosSig().filter(p => p.stock > 0));

  form = this.fb.group({
    id: [null as number | null],
    productoId: [null as number | null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0.01)]],
    clienteId: [null as number | null, Validators.required],
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
    productos.forEach((p) => (this.productoMap[p.id] = p.nombre));
    const pid = this.form.get('productoId')?.value;
    if (pid != null) this.updatePrecioFromProducto(pid);
  });

  ngOnInit() {
    this.ventasSvc.list();
    this.productosSvc.list();
    this.clientesSvc.list();

    this.form.get('productoId')?.valueChanges.subscribe(productoId => {
      const id = typeof productoId === 'string' ? Number(productoId) : productoId;
      const producto = this.productosSig().find(p => p.id === id);
      this.form.get('precioUnitario')?.setValue(producto?.precio ?? 0);
    });

    this.form.get('productoId')?.valueChanges.subscribe((productoId) => {
      this.updatePrecioFromProducto(productoId);
    });
  }

  private updatePrecioFromProducto(productoId: unknown) {
    if (productoId == null) {
      this.form.get('precioUnitario')?.setValue(0);
      return;
    }
    const idNum = typeof productoId === 'string' ? Number(productoId) : (productoId as number);
    if (Number.isNaN(idNum)) {
      this.form.get('precioUnitario')?.setValue(0);
      return;
    }
    const producto = this.productosSig().find((p) => p.id === idNum);
    const precio = producto?.precio ?? 0;
    this.form.get('precioUnitario')?.setValue(precio);
  }

  ventasFiltradas = computed(() => {
    const filters = this.appliedFiltersSig();
    const idFiltro = filters.id.trim().toLowerCase();
    const fechaFiltro = filters.fecha.trim();
    const prodFiltro = filters.producto.trim().toLowerCase();

    return this.ventasSig().filter((v) => {
      const matchId = !idFiltro || v.id.toString().toLowerCase().includes(idFiltro);
      const matchFecha = !fechaFiltro || v.fecha.startsWith(fechaFiltro);
      const nombreProducto = this.getNombreProductoDirecto(v.productoId).toLowerCase();
      const matchProducto = !prodFiltro || nombreProducto.includes(prodFiltro);
      return matchId && matchFecha && matchProducto;
    });
  });

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

  add() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();

    this.ventasSvc.create({
      productoId: raw.productoId!,
      cantidad: raw.cantidad!,
      precioUnitario: raw.precioUnitario!,
      clienteId: raw.clienteId ?? undefined,
    }).subscribe(() => {
      this.ventasSvc.list();
      this.metricsSvc.refresh();
      this.form.reset({
        cantidad: 1,
        precioUnitario: 0,
        clienteId: null,
      });
      this.form.get('precioUnitario')?.disable();
      this.mostrarFormulario = false;
    });
  }

  update() {
    if (this.form.invalid || !this.form.value.id) return;
    const raw = this.form.getRawValue();

    this.ventasSvc.update({
      id: raw.id!,
      productoId: raw.productoId!,
      cantidad: raw.cantidad!,
      precioUnitario: raw.precioUnitario!,
      clienteId: raw.clienteId ?? undefined,
      fecha: '',
    }).subscribe(() => {
      this.ventasSvc.list();
      this.metricsSvc.refresh();
      this.form.reset({
        cantidad: 1,
        precioUnitario: 0,
        clienteId: null,
      });
      this.form.get('precioUnitario')?.disable();
      this.editandoVenta = false;
      this.mostrarFormulario = false;
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.editandoVenta = false;
      this.form.reset({
        cantidad: 1,
        precioUnitario: 0,
        clienteId: null,
      });
      this.form.get('precioUnitario')?.disable();
    }
  }

  editarVenta(venta: Venta) {
    this.form.patchValue({
      id: venta.id,
      productoId: venta.productoId,
      cantidad: venta.cantidad,
      clienteId: venta.clienteId ?? null,
    });
    this.updatePrecioFromProducto(venta.productoId);
    this.mostrarFormulario = true;
    this.editandoVenta = true;
  }
}
