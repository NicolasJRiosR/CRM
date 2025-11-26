import { Component, inject } from '@angular/core';
import { ProductosService } from '../productos.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-productos-list',
  imports: [RouterLink, CommonModule],
  templateUrl: './productos-list.component.html',
})
export class ProductosListComponent {
  svc = inject(ProductosService);

  ngOnInit() {
    this.svc.list();
  }
}
