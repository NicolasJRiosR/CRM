import { Component, computed, OnInit, inject, signal } from '@angular/core';
import { ProveedoresService } from '../ProveedoresService';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-proveedor-list',
  templateUrl: './proveedor-list.component.html',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
})
export class ProveedorListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private proveedoresService = inject(ProveedoresService);

  proveedores = computed(() => this.proveedoresService.proveedoresSig());

 
  filtroForm: FormGroup = this.fb.group({
    id: [''],
    nombre: [''],
    contacto: [''],
  });

  filtrosSig = signal({
    id: '',
    nombre: '',
    contacto: '',
  });

  proveedoresFiltrados = computed(() => {
    const filtros = this.filtrosSig();

    const filtroId = filtros.id.toLowerCase();
    const filtroNombre = filtros.nombre.toLowerCase();
    const filtroContacto = filtros.contacto.toLowerCase();

    return this.proveedores().filter((p) => {
      const idMatch = !filtroId || p.id.toString().includes(filtroId);
      const nombreMatch =
        !filtroNombre || p.nombre.toLowerCase().includes(filtroNombre);
      const contactoMatch =
        !filtroContacto ||
        (p.contacto ?? '').toLowerCase().includes(filtroContacto);

      return idMatch && nombreMatch && contactoMatch;
    });
  });

  ngOnInit() {
    this.proveedoresService.list();

    this.filtroForm.valueChanges.subscribe((values) => {
      this.filtrosSig.set({
        id: values.id ?? '',
        nombre: values.nombre ?? '',
        contacto: values.contacto ?? '',
      });
    });
  }

  limpiar() {
    this.filtroForm.reset({
      id: '',
      nombre: '',
      contacto: '',
    });

    this.filtrosSig.set({
      id: '',
      nombre: '',
      contacto: '',
    });
  }
}
