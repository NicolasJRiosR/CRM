import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-inventario-altas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventario-altas.component.html',
  styleUrls: ['./inventario-altas.component.css']
})
export class InventarioAltasComponent {
  inventarioForm = new FormGroup({
    jugador: new FormControl('', [Validators.required]),
    equipo: new FormControl('', [Validators.required]),
    temporada: new FormControl('', [Validators.required]),
    talla: new FormControl('', [Validators.required]),
    stock: new FormControl(0, [Validators.required, Validators.min(1)]),
    precio: new FormControl(0, [Validators.required, Validators.min(0.01)]),
    color: new FormControl('', [Validators.required]),
    fechaAlta: new FormControl(new Date().toISOString().substring(0, 10))
  });

  onSubmit() {
    if (this.inventarioForm.valid) {
      console.log('Camiseta enviada:', this.inventarioForm.value);
      // Aqui hay que llamar al servicio para enviar al backend los datos
    } else {
      console.log('Formulario inválido');
    }
  }
}
