import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InventarioListaComponent } from './components/inventario-lista/inventario-lista.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,InventarioListaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front';
}
