import { Component, inject } from '@angular/core';
import { ComprasService } from './compras.service';
import { ProductosService } from '../productos/productos.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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

  form = this.fb.group({
    productoId: [null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0)]],
    proveedorId: [null],
  });

  ngOnInit() { 
    this.comprasSvc.list(); 
    this.productosSvc.list(); 
  }

  add() {
    if (this.form.invalid) return;
    this.comprasSvc.create(this.form.value as any).subscribe(() => {
      this.comprasSvc.list();
      this.productosSvc.list(); // stock actualizado por backend
      this.form.reset({ cantidad: 1, precioUnitario: 0 });
    });
  }
}
