import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: '../navbar/NavbarComponent.html',
})
export class NavbarComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token'); // o sessionStorage
    this.router.navigate(['/login']);
  }
}
