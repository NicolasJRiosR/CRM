import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', canActivate: [authGuard],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'clientes', canActivate: [authGuard],
        loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES) },
      { path: 'interacciones', canActivate: [authGuard],
        loadChildren: () => import('./features/interacciones/interacciones.routes').then(m => m.INTERACCIONES_ROUTES) },
      { path: 'productos', canActivate: [authGuard],
        loadChildren: () => import('./features/productos/productos.routes').then(m => m.PRODUCTOS_ROUTES) },
      { path: 'ventas', canActivate: [authGuard],
        loadChildren: () => import('./features/ventas/ventas.routes').then(m => m.VENTAS_ROUTES) },
      { path: 'compras', canActivate: [authGuard],
        loadChildren: () => import('./features/compras/compras.routes').then(m => m.COMPRAS_ROUTES) },
      { path: 'logout', canActivate: [authGuard],
        loadComponent: () => import('./features/auth/logout/logout.component').then(m => m.LogoutComponent) },
    ],
  },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
 
  { path: '**', redirectTo: 'dashboard' },
];
