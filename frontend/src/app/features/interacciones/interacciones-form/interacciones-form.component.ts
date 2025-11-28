import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InteraccionesService, Interaccion } from '../interacciones.service';
import { CustomerService } from '../../clientes/customer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-interacciones-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './interacciones-form.component.html',
})
export class InteraccionesFormComponent {
  fb = inject(FormBuilder);
  svc = inject(InteraccionesService);
  clientesSvc = inject(CustomerService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  clientesSig = this.clientesSvc.clientesSig;

  id = Number(this.route.snapshot.paramMap.get('id'));
  current: Interaccion | null = null;

  form = this.fb.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    fechaHora: ['', Validators.required],
    tipo: ['LLAMADA', Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
  });

  ngOnInit() {
    this.clientesSvc.list();
    if (this.id) {
      this.svc.list();
      const found = this.svc.interaccionesSig().find(i => i.id === this.id);
      if (found) {
        this.current = found;
        this.form.patchValue(found);
      }
    }
  }

  save() {
    if (this.form.invalid) return;
    const value = this.form.value as Omit<Interaccion, 'id'>;

    if (this.current) {
      const payload = { ...this.current, ...value };
      this.svc.update(payload).subscribe(() => this.router.navigate(['/interacciones']));
    } else {
      this.svc.create(value).subscribe(() => this.router.navigate(['/interacciones']));
    }
  }
}
