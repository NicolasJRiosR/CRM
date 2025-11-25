import { Routes } from '@angular/router';
export const INTERACCIONES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./interacciones-list/interacciones-list.component').then(m => m.InteraccionesListComponent) },
];
