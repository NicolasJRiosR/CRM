import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-grafico-burbujas-char',
  standalone: true,
  imports: [],
  templateUrl: './grafico-burbujas-char.component.html',
  styleUrl: './grafico-burbujas-char.component.css'
})
export class GraficoBurbujasCharComponent {
  @Input() data: any[] = [];
  
}
