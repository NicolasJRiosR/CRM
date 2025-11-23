import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ClientesService } from '../../services/clientes/clientes.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clientes-altas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './clientes-altas.component.html',
  styleUrls: ['./clientes-altas.component.css']
})
export class ClientesAltasComponent implements OnInit {
  clienteForm!: FormGroup;

  constructor(private fb: FormBuilder, private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.clienteForm = this.fb.group({
      // Datos personales
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccionCompleta: ['', Validators.required],

      // Preferencias del cliente
      talla: [''],
      equipoFavorito: [''],
      jugadorFavorito: [''],

      // Otros datos
      haCompradoAntes: [false],
      deseaRecibirPromociones: [false],
    });
  }

  onSubmit(): void {
    if (this.clienteForm.valid) {
      this.clientesService.crearCliente(this.clienteForm.value).subscribe({
        next: (nuevo) => {
          console.log('Cliente creado:', nuevo);
          this.clienteForm.reset();
        },
        error: (err) => {
          console.error('Error creando cliente', err);
        }
      });
    }
  }
}
