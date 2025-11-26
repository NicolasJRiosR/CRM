import { Routes } from '@angular/router';

export const INTERACCIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./interacciones-list/interacciones-list.component')
        .then(m => m.InteraccionesListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./interacciones-form/interacciones-form.component')
        .then(m => m.InteraccionesFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./interacciones-form/interacciones-form.component')
        .then(m => m.InteraccionesFormComponent),
  },
];
