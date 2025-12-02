import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ComprasService, Compra } from '../compras.service';
import { ProductosService } from '../../productos/productos.service';
import { ProveedoresService } from '../../proveedor/ProveedoresService';

type CompraFormValue = {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  proveedorId?: number;
};

@Component({
  standalone: true,
  selector: 'app-compras-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './compras-form.component.html',
})
export class ComprasFormComponent {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  comprasSvc = inject(ComprasService);
  productosSvc = inject(ProductosService);
  proveedoresSvc = inject(ProveedoresService);

  compraId = Number(this.route.snapshot.paramMap.get('id'));
  current: Compra | null = null;

  productosSig = this.productosSvc.productosSig;
  proveedoresSig = this.proveedoresSvc.proveedoresSig;

  form = this.fb.nonNullable.group({
    productoId: [0, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0.01)]],
    proveedorId: [0, Validators.required],
  });

  ngOnInit() {
    this.productosSvc.list();
    this.proveedoresSvc.list();

    if (this.compraId > 0) {
      // Buscamos la compra en comprasSig() para prellenar
      const compra = this.comprasSvc
        .comprasSig()
        .find((c) => c.id === this.compraId);
      if (compra) {
        this.current = compra;
        this.form.patchValue({
          productoId: compra.productoId,
          cantidad: compra.cantidad,
          precioUnitario: compra.precioUnitario,
          proveedorId: compra.proveedorId ?? 0,
        });
      } else {
        this.router.navigate(['/compras']); // Si no existe, volver a lista
      }
    }
  }

  save() {
    if (this.form.invalid) return;

    const value: CompraFormValue = this.form.getRawValue();

    if (this.current) {
      const payload: Compra = {
        ...this.current,
        productoId: value.productoId,
        cantidad: value.cantidad,
        precioUnitario: value.precioUnitario,
        proveedorId: value.proveedorId,
        fecha: new Date().toISOString(),
      };
      this.comprasSvc.update(payload).subscribe(() => {
        this.comprasSvc.list();
        this.router.navigate(['/compras']);
      });
    } else {
      const newCompra: Omit<Compra, 'id' | 'fecha'> = {
        productoId: value.productoId,
        cantidad: value.cantidad,
        precioUnitario: value.precioUnitario,
        proveedorId: value.proveedorId,
      };
      this.comprasSvc.create(newCompra).subscribe(() => {
        this.comprasSvc.list();
        this.router.navigate(['/compras']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/compras']);
  }
}
