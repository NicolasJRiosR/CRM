import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metrics-table',
  standalone: true,
  imports: [],
  templateUrl: './metrics-table.component.html',
  styleUrls: ['./metrics-table.component.css']
})
export class MetricsTableComponent {
  
  @Input() metrics: { name: string; value: any }[] = [];
}

