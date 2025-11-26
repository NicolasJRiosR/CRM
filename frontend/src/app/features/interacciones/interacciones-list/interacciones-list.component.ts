import { Component, inject, effect } from '@angular/core';
import { InteraccionesService } from '../interacciones.service';
import { CustomerService } from '../../clientes/customer.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
@Component({
  standalone: true,
  selector: 'app-interacciones-list',
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './interacciones-list.component.html',
})
export class InteraccionesListComponent {
  svc = inject(InteraccionesService);
  clientesSvc = inject(CustomerService);

  clienteId?: number;
  clientesMap = new Map<number, string>();

  clientesEffect = effect(() => {
    const clientes = this.clientesSvc.clientesSig();
    this.clientesMap.clear();
    clientes.forEach(c => this.clientesMap.set(c.id, c.nombre));
  });

  ngOnInit() {
    this.svc.list();
    this.clientesSvc.list();
  }

  clienteNombre(id: number): string {
    return this.clientesMap.get(id) ?? `ID ${id}`;
  }

  filter() {
    this.svc.list(this.clienteId);
  }
}
