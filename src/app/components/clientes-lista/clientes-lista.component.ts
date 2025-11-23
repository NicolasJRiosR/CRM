import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService, Cliente } from '../../services/clientes/clientes.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './clientes-lista.component.html',
  styleUrls: ['./clientes-lista.component.css']
})
export class ClientesListaComponent implements OnInit {
  clientes: Cliente[] = [];

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (err) => {
        console.error('Error cargando clientes', err);
      }
    });
  }
}
