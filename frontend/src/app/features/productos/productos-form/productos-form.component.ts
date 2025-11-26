import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosService, Producto } from '../productos.service';
import { ProveedoresService } from '../../proveedor/ProveedoresService';

import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type ProductoFormValue = {
  nombre: string;
  stock: number;
  precio: number;
  proveedorId: number;
};

@Component({
  standalone: true,
  selector: 'app-productos-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './productos-form.component.html',
})
export class ProductosFormComponent {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  svc = inject(ProductosService);
  proveedoresSvc = inject(ProveedoresService);

  id = Number(this.route.snapshot.paramMap.get('id'));
  current: Producto | null = null;

  // señal de proveedores
  proveedoresSig = this.proveedoresSvc.proveedoresSig;

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    proveedorId: [0, Validators.required],
  });

  ngOnInit() {
    this.proveedoresSvc.list(); // carga proveedores
    if (this.id) {
      this.svc.find(this.id).subscribe(p => {
        this.current = p;
        this.form.patchValue(p);
      });
    }
  }

  save() {
    if (this.form.invalid) return;

    const value: ProductoFormValue = this.form.getRawValue();

    if (this.current) {
      const payload: Producto = { ...this.current, ...value };
      this.svc.update(payload).subscribe(() => this.router.navigate(['/productos']));
    } else {
      this.svc.create(value).subscribe(() => this.router.navigate(['/productos']));
    }
  }
}
