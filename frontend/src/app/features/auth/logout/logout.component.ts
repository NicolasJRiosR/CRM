import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-logout',
  template: `<p class="text-center">Saliendo...</p>`,
})
export class LogoutComponent {
  router = inject(Router);
  ngOnInit() { sessionStorage.clear(); this.router.navigate(['/login']); }
}
