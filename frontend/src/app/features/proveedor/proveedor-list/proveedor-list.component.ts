import { Component, computed, OnInit } from '@angular/core';
import { ProveedoresService } from '../ProveedoresService';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-proveedor-list',
  templateUrl: './proveedor-list.component.html',
  standalone: true,
  imports: [RouterLink]
})
export class ProveedorListComponent implements OnInit {
  proveedores = computed(() => this.proveedoresService.proveedoresSig());

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit() {
    this.proveedoresService.list();
  }
}
