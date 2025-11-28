import { Component, signal, OnInit } from '@angular/core';
import { ProveedoresService, Proveedor } from '../ProveedoresService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-proveedor-form',
  templateUrl: './proveedor-form.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ProveedorFormComponent implements OnInit {
  // Señal que almacena el proveedor actual
  proveedor = signal<Proveedor>({
    id: 0,
    nombre: '',
    contacto: '',
    telefono: '',
  });

  guardado = signal(false);
  isEdit = false;

  constructor(
    private proveedoresService: ProveedoresService,
    private route: ActivatedRoute,
    public router: Router,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    // Modo edición
    if (id) {
      this.isEdit = true;
      this.proveedoresService.find(+id).subscribe((p) => {
        if (p) {
          this.proveedor.set(p);
        }
      });
    }
  }

  // Actualizar una propiedad del proveedor usando signals
  update<K extends keyof Proveedor>(key: K, value: Proveedor[K]) {
    this.proveedor.update((p) => ({ ...p, [key]: value }));
  }

  // Guardar creación o edición
  save() {
    this.guardado.set(false);
    const data = this.proveedor();

    if (this.isEdit) {
      // EDITAR
      this.proveedoresService.update(data).subscribe(() => {
        this.proveedoresService.list();
        this.guardado.set(true);
        this.router.navigate(['/proveedores']);
      });
    } else {
      // CREAR
      this.proveedoresService
        .create({
          nombre: data.nombre,
          contacto: data.contacto,
          telefono: data.telefono,
        })
        .subscribe(() => {
          // limpiar campos
          this.proveedor.set({ id: 0, nombre: '', contacto: '', telefono: '' });
          this.proveedoresService.list();
          this.guardado.set(true);
          this.router.navigate(['/proveedores']);
        });
    }
  }
}
