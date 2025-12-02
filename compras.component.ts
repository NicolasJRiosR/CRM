import { Component, inject } from "@angular/core";
import { FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ComprasService, Compra } from "../compras.service";
import { ProductosService } from "../../productos/productos.service";
import { ProveedoresService } from "../../proveedor/ProveedoresService";

@Component({
  selector: "app-compras-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./compras-form.component.html",
})
export class ComprasFormComponent {
  comprasSvc = inject(ComprasService);
  productosSvc = inject(ProductosService);
  proveedoresSvc = inject(ProveedoresService);
  fb = inject(FormBuilder);

  productosSig = this.productosSvc.productosSig;
  proveedoresSig = this.proveedoresSvc.proveedoresSig;

  form = this.fb.group({
    productoId: [null as number | null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0.01)]],
    proveedorId: [null as number | null, Validators.required],
  });

  editandoCompra = false;
  compraEditandoId: number | null = null;

  ngOnInit() {
    this.productosSvc.list();
    this.proveedoresSvc.list();
  }

  add() {
    if (this.form.invalid) return;

    const compraData: Omit<Compra, "id" | "fecha"> = {
      productoId: this.form.value.productoId!,
      cantidad: this.form.value.cantidad!,
      precioUnitario: this.form.value.precioUnitario!,
      proveedorId: this.form.value.proveedorId!,
    };

    this.comprasSvc.create(compraData).subscribe(() => {
      this.comprasSvc.list(); // actualiza la lista de compras
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
      this.comprasSvc.list(); // actualiza la lista de compras
      this.resetForm();
    });
  }

  toggleFormulario() {
    this.editandoCompra = false;
    this.compraEditandoId = null;
    this.resetForm();
  }

  private resetForm() {
    this.form.reset({
      cantidad: 1,
      precioUnitario: 0,
      proveedorId: null,
      productoId: null,
    });
  }
}
