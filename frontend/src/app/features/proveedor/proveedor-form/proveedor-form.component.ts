import { Component, signal } from '@angular/core';
import { ProveedoresService, Proveedor } from '../ProveedoresService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-proveedor-form',
  templateUrl: './proveedor-form.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProveedorFormComponent {
  proveedor = signal<Omit<Proveedor, 'id'>>({ nombre: '', contacto: '', telefono: '' });
  guardado = signal(false);

  constructor(private proveedoresService: ProveedoresService) {}

  update<K extends keyof Omit<Proveedor, 'id'>>(key: K, value: Omit<Proveedor, 'id'>[K]) {
    this.proveedor.update(p => ({ ...p, [key]: value }));
  }

  save() {
    this.guardado.set(false);
    this.proveedoresService.create(this.proveedor()).subscribe(() => {
      this.proveedor.set({ nombre: '', contacto: '', telefono: '' });
      this.proveedoresService.list();
      this.guardado.set(true);
    });
  }
}
