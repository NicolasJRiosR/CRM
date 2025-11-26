import { Routes } from '@angular/router';

export const PROVEEDORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./proveedor-list/proveedor-list.component').then(m => m.ProveedorListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./proveedor-form/proveedor-form.component').then(m => m.ProveedorFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./proveedor-form/proveedor-form.component').then(m => m.ProveedorFormComponent),
  },
];
