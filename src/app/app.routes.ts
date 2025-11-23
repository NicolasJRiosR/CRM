import { Routes } from '@angular/router';
import { InventarioListaComponent } from './components/inventario-lista/inventario-lista.component';
import { InventarioAltasComponent } from './components/inventario-altas/inventario-altas.component';
import { ClientesListaComponent } from './components/clientes-lista/clientes-lista.component';
import { ClientesAltasComponent } from './components/clientes-altas/clientes-altas.component';


export const routes: Routes = [
  { path: 'inventario/lista', component: InventarioListaComponent },
  { path: 'inventario/altas', component: InventarioAltasComponent },
  { path: '', redirectTo: 'inventario/lista', pathMatch: 'full' }, 
  { path: 'clientes/lista', component: ClientesListaComponent },
  { path: 'clientes/alta', component: ClientesAltasComponent },
  { path: '', redirectTo: 'clientes/lista', pathMatch: 'full' }
];
