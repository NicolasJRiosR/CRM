import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VentasService, Venta } from '../ventas.service';
import { ProductosService } from '../../productos/productos.service';
import { CustomerService } from '../../clientes/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../../shared/services/metrics.service';

@Component({
  standalone: true,
  selector: 'app-ventas-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ventas-form.component.html',
})
export class VentasFormComponent implements OnInit {
  fb = inject(FormBuilder);
  ventasSvc = inject(VentasService);
  productosSvc = inject(ProductosService);
  clientesSvc = inject(CustomerService);
  metricsSvc = inject(MetricsService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  id = Number(this.route.snapshot.paramMap.get('id'));
  current: Venta | null = null;

 
  productosDisponibles = () =>
    this.productosSvc.productosSig().filter(p => p.stock > 0);

  clientesSig = this.clientesSvc.clientesSig;

  form = this.fb.nonNullable.group({
    productoId: [0, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [
      { value: 0, disabled: true },
      [Validators.required, Validators.min(0.01)],
    ],
    clienteId: [0, Validators.required],
  });

  ngOnInit() {
    this.productosSvc.list();
    this.clientesSvc.list();

    if (this.id > 0) {
      const venta = this.ventasSvc.ventasSig().find((v) => v.id === this.id);
      if (venta) this.cargarVenta(venta);
    }

    
    this.form.get('productoId')?.valueChanges.subscribe((productoId) => {
      const p = this.productosDisponibles().find(
        (x) => x.id === Number(productoId),
      );
      this.form.get('precioUnitario')?.setValue(p?.precio ?? 0);

      if (p) {
        const cantidadCtrl = this.form.get('cantidad');
        cantidadCtrl?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(p.stock), 
        ]);
        cantidadCtrl?.updateValueAndValidity();
      }
    });
  }

  cargarVenta(venta: Venta) {
    this.current = venta;
    this.form.patchValue({
      productoId: venta.productoId,
      cantidad: venta.cantidad,
      clienteId: venta.clienteId ?? 0,
      precioUnitario: venta.precioUnitario,
    });
  }

  save() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    if (this.current) {
      const payload: Venta = { ...this.current, ...raw, fecha: '' };
      this.ventasSvc.update(payload).subscribe(() => {
        this.ventasSvc.list();
        this.metricsSvc.refresh();
        this.router.navigate(['/ventas']);
      });
    } else {
      this.ventasSvc.create(raw).subscribe(() => {
        this.ventasSvc.list();
        this.metricsSvc.refresh();
        this.router.navigate(['/ventas']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/ventas']);
  }

  get productoSeleccionado() {
  const id = this.form.value.productoId;
  return this.productosDisponibles().find(p => p.id === id);
}

}
