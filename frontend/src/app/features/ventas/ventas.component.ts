import { Component, inject } from '@angular/core';
import { VentasService } from './ventas.service';
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

  form = this.fb.group({
    productoId: [null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0)]],
    clienteId: [null],
  });

  ngOnInit() {
    this.ventasSvc.list();
    this.productosSvc.list();
    this.clientesSvc.list();
  }

  add() {
    if (this.form.invalid) return;
    this.ventasSvc.create(this.form.value as any).subscribe(() => {
      this.ventasSvc.list();
      this.productosSvc.list();
      this.form.reset({ cantidad: 1, precioUnitario: 0 });
    });
  }
}
