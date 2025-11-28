import { Component, inject } from '@angular/core';
import { ProductosService } from '../productos.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-productos-list',
  imports: [CommonModule],
  templateUrl: './productos-list.component.html',
})
export class ProductosListComponent {
  svc = inject(ProductosService);
  router = inject(Router);

  ngOnInit() {
    this.svc.list();
  }
}
