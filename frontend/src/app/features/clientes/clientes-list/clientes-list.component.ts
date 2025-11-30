import { Component, inject, signal, computed } from '@angular/core';
import { Cliente, CustomerService } from '../customer.service';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-clientes-list',
  imports: [RouterLink, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent {
  svc = inject(CustomerService);
  fb = inject(FormBuilder);


  filtroForm = this.fb.group({
    id: [''],
    nombre: [''],
    email: [''],
  });

 
  appliedFiltersSig = signal<{ id: string; nombre: string; email: string }>({
    id: '',
    nombre: '',
    email: '',
  });


  clientes() {
    return this.svc.clientesSig();
  }


  clientesFiltrados = computed(() => {
    const filters = this.appliedFiltersSig();
    const idFiltro = filters.id.trim().toLowerCase();
    const nombreFiltro = filters.nombre.trim().toLowerCase();
    const emailFiltro = filters.email.trim().toLowerCase();

    return this.svc.clientesSig().filter((c: Cliente) => {
      const matchId = !idFiltro || c.id.toString().toLowerCase().includes(idFiltro);
      const matchNombre = !nombreFiltro || c.nombre.toLowerCase().includes(nombreFiltro);
      const matchEmail = !emailFiltro || c.email.toLowerCase().includes(emailFiltro);
      return matchId && matchNombre && matchEmail;
    });
  });


  ngOnInit() {
    this.svc.list();

    // Aplica el filtro automáticamente al escribir
    this.filtroForm.valueChanges.subscribe(({ id, nombre, email }) => {
      this.appliedFiltersSig.set({
        id: (id ?? '').toString(),
        nombre: nombre ?? '',
        email: email ?? '',
      });
    });
  }


  formatTelefono(t: string): string {
    const limpio = t.replace(/\D/g, '');
    return limpio.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }


  filtrar() {
    const { id, nombre, email } = this.filtroForm.value;
    this.appliedFiltersSig.set({
      id: (id ?? '').toString(),
      nombre: nombre ?? '',
      email: email ?? '',
    });
  }

  limpiar() {
    this.filtroForm.reset({ id: '', nombre: '', email: '' });
    this.appliedFiltersSig.set({ id: '', nombre: '', email: '' });
  }
}
