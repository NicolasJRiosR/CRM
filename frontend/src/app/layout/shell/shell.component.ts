import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  auth = inject(AuthService);
  router = inject(Router);

  logout() {
    localStorage.removeItem('token'); 
    this.router.navigate(['/login']);
  }
}
