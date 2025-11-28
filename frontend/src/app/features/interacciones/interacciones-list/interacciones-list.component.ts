import { Component, inject, effect, computed, signal } from '@angular/core';
import { InteraccionesService } from '../interacciones.service';
import { CustomerService } from '../../clientes/customer.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-interacciones-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './interacciones-list.component.html',
})
export class InteraccionesListComponent {
  svc = inject(InteraccionesService);
  clientesSvc = inject(CustomerService);
  fb = inject(FormBuilder);

  clientesMap = new Map<number, string>();

  // ----------------------------
  //   FORM DE FILTRO
  // ----------------------------
  filtroForm = this.fb.group({
    cliente: [''],
    fecha: [''],
    tipo: [''],
  });

  // ----------------------------
  //   STATE DE FILTROS APLICADOS
  // ----------------------------
  appliedFiltersSig = signal<{ cliente: string; fecha: string; tipo: string }>({
    cliente: '',
    fecha: '',
    tipo: '',
  });

  // ----------------------------
  //   MÉTODOS DE FILTRAR Y LIMPIAR
  // ----------------------------
  filtrar() {
    const { cliente, fecha, tipo } = this.filtroForm.value;
    this.appliedFiltersSig.set({
      cliente: (cliente ?? '').toString(),
      fecha: fecha ?? '',
      tipo: tipo ?? '',
    });
  }

  limpiar() {
    this.filtroForm.reset({ cliente: '', fecha: '', tipo: '' });
    this.appliedFiltersSig.set({ cliente: '', fecha: '', tipo: '' });
  }

 // ----------------------------
//   LISTA FILTRADA
// ----------------------------
interaccionesFiltradas = computed(() => {
  const filters = this.appliedFiltersSig();
  const clienteFiltro = filters.cliente.trim().toLowerCase();
  const fechaFiltro = filters.fecha.trim();
  const tipoFiltro = filters.tipo.trim().toLowerCase();

  return this.svc.interaccionesSig().filter((i) => {
    // Buscar nombre del cliente en el mapa
    const nombreCliente = (this.clienteNombre(i.clienteId) ?? '').toLowerCase();

    const matchCliente =
      !clienteFiltro || nombreCliente.includes(clienteFiltro);

    const matchFecha =
      !fechaFiltro || i.fechaHora.startsWith(fechaFiltro);

    const matchTipo =
      !tipoFiltro || i.tipo.toLowerCase().includes(tipoFiltro);

    return matchCliente && matchFecha && matchTipo;
  });
});


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
}
