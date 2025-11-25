import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosService, Producto } from '../productos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  id = Number(this.route.snapshot.paramMap.get('id'));
  current: Producto | null = null;

  form = this.fb.group({
    nombre: ['', Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    activo: [true],
  });

  ngOnInit() { if (this.id) this.svc.find(this.id).subscribe(p => { this.current = p; this.form.patchValue(p); }); }
  save() {
    if (this.form.invalid) return;
    const value = this.form.value as Omit<Producto,'id'>;
    if (this.current) { const payload = { ...this.current, ...value }; this.svc.update(payload).subscribe(() => this.router.navigate(['/productos'])); }
    else { this.svc.create(value).subscribe(() => this.router.navigate(['/productos'])); }
  }
}
