import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService, Cliente } from '../customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-clientes-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './clientes-form.component.html',
})
export class ClientesFormComponent {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  svc = inject(CustomerService);

  id = Number(this.route.snapshot.paramMap.get('id'));
  current: Cliente | null = null;

  form = this.fb.group({
    nombre: ['', Validators.required],

    // El campo "email" es obligatorio y debe cumplir requisitos como tener un @,
    // terminar en .com, .es, .net o .org y sino dara error
    // - Contener un @
    email: ['', [
      Validators.required,
      Validators.pattern(/^[\w.-]+@[\w.-]+\.(com|es|net|org)$/i)
    ]],

    telefono: ['', [
      Validators.required,
      Validators.pattern(/^(?:\s*\d\s*){9}$/) // exactamente 9 dígitos, espacios permitidos
    ]],
  });


  ngOnInit() {
    if (this.id) {
      this.svc.find(this.id).subscribe(found => { 
        this.current = found; 
        this.form.patchValue(found); 
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    const value = this.form.value as Omit<Cliente, 'id'>;
    if (this.current) {
      const payload = { ...this.current, ...value };
      this.svc.update(payload).subscribe(() => this.router.navigate(['/clientes']));
    } else {
      this.svc.create(value).subscribe(() => this.router.navigate(['/clientes']));
    }
  }
}
