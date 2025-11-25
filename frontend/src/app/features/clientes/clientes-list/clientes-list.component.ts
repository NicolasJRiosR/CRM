import { Component, inject } from '@angular/core';
import { CustomerService } from '../customer.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  standalone: true,
  selector: 'app-clientes-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent {
  svc = inject(CustomerService);
  q = '';

 
  clientes() {
    return this.svc.clientesSig();
  }

  ngOnInit() {
    this.svc.list();
  }

  search() {
    this.svc.list(this.q);
  }

  del(id: number) {
    this.svc.remove(id).subscribe(() => this.svc.list(this.q));
  }
}
