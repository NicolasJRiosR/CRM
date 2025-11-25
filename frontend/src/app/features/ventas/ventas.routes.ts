import { Routes } from '@angular/router';
export const VENTAS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./ventas.component').then(m => m.VentasComponent) },
];
