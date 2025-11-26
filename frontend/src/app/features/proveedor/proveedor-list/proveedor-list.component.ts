import { Component, computed, OnInit } from '@angular/core';
import { ProveedoresService } from '../ProveedoresService';

@Component({
  selector: 'app-proveedor-list',
  templateUrl: './proveedor-list.component.html',
  standalone: true
})
export class ProveedorListComponent implements OnInit {
  proveedores = computed(() => this.proveedoresService.proveedoresSig());

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit() {
    this.proveedoresService.list();
  }

  deleteProveedor(id: number) {
    this.proveedoresService.remove(id).subscribe(() => this.proveedoresService.list());
  }
}
