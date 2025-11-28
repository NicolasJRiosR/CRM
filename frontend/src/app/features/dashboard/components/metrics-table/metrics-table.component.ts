import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metrics-table',
  standalone: true,
  imports: [],
  templateUrl: './metrics-table.component.html',
  styleUrls: ['./metrics-table.component.css']
})
export class MetricsTableComponent {
  // El padre le pasa un array de métricas
  @Input() metrics: { name: string; value: any }[] = [];
}

