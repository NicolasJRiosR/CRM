import { Component, inject, effect } from '@angular/core';
import { InteraccionesService } from '../interacciones.service';
import { CustomerService } from '../../clientes/customer.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-interacciones-list',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './interacciones-list.component.html',
})
export class InteraccionesListComponent {
  svc = inject(InteraccionesService);
  clientesSvc = inject(CustomerService);
  fb = inject(FormBuilder);

  clienteId?: number;
  clientesMap = new Map<number, string>();

  form = this.fb.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    fecha: ['', Validators.required],
    tipo: ['LLAMADA', Validators.required],
    nota: ['', Validators.required],
  });

  ngOnInit() {
    this.svc.list();
    this.clientesSvc.list(); // carga todos los clientes

    //  usar effect para reaccionar al signal
    effect(() => {
      const clientes = this.clientesSvc.clientesSig(); // invocas el signal
      this.clientesMap.clear();
      clientes.forEach(c => this.clientesMap.set(c.id, c.nombre));
    });
  }

  clienteNombre(id: number): string {
    return this.clientesMap.get(id) ?? `ID ${id}`;
  }

  filter() {
    this.svc.list(this.clienteId);
  }

  add() {
    if (this.form.invalid) return;
    this.svc.create(this.form.value as any).subscribe(() => {
      this.form.reset({ clienteId: 0, tipo: 'LLAMADA' });
      this.svc.list(this.clienteId);
    });
  }
}
