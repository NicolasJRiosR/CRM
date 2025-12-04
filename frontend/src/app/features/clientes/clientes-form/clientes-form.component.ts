import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerService, Cliente } from '../customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-clientes-form',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './clientes-form.component.html',
})
export class ClientesFormComponent {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  svc = inject(CustomerService);


  current = signal<Cliente | null>(null);

  id = Number(this.route.snapshot.paramMap.get('id'));

  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [
      Validators.required,
      Validators.pattern(/^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i)
    ]],
    telefono: ['', [
      Validators.required,
      Validators.pattern(/^\d{9}$/)
    ]],
  });

  ngOnInit() {
    if (this.id) {
      this.svc.find(this.id).subscribe(found => {
        this.current.set(found);
        this.form.patchValue(found);
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    const value = this.form.value as Omit<Cliente, 'id'>;

    const action = this.current()
      ? this.svc.update({ ...this.current()!, ...value })
      : this.svc.create(value);

    action.subscribe(() => this.router.navigate(['/clientes']));
  }
}
