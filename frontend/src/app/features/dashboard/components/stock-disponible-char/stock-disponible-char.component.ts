import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-stock-disponible-char',
  standalone: true,
  imports: [],
  templateUrl: './stock-disponible-char.component.html',
  styleUrl: './stock-disponible-char.component.css'
})
export class StockDisponibleCharComponent {
  @Input() counts: Record<'disponible' | 'agotado', number> = { disponible: 0, agotado: 0 };
  @ViewChild('host', { static: true }) host!: ElementRef;

  ngOnChanges() {
    if (!this.counts) return;
    this.renderStockDonut(this.host.nativeElement, this.counts);
  }

  // gráfico de donut para stock disponibilidad
    private renderStockDonut(element: HTMLElement, counts: Record<string, number>) {
      d3.select(element).selectAll('*').remove();
  
  
     const data: { estado: 'disponible' | 'agotado'; value: number }[] = [
        { estado: 'disponible', value: counts['disponible'] ?? 0 },
        { estado: 'agotado', value: counts['agotado'] ?? 0 },
      ];
  
  
      const width = 250;
      const height = 300;
      const radius = Math.min(width, height) / 2;
  
  
      const svg = d3.select(element)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2 })`);
  
  
      const color = d3.scaleOrdinal<'disponible' | 'agotado', string>()
        .domain(['disponible', 'agotado'])
        .range(['#238bd1ff', '#F44336']);
  
  
      const pie = d3.pie<{ estado: 'disponible' | 'agotado'; value: number }>()
        .value(d => d.value);
  
  
      const arc = d3.arc<d3.PieArcDatum<{ estado: 'disponible' | 'agotado'; value: number }>>()
        .innerRadius(75)
        .outerRadius(radius);
  
  
      svg.selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.estado))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1);
    }
}
