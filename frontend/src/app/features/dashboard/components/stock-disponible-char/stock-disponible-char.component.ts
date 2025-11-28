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
  @ViewChild('donut', { static: true }) donut!: ElementRef;

  ngOnChanges() {
    if (!this.counts) return;
    this.renderStockDonut(this.donut.nativeElement, this.counts);
  }

  // gráfico de donut para stock disponibilidad
    private renderStockDonut(element: HTMLElement, counts: Record<string, number>) {
  d3.select(element).selectAll('*').remove();

  const data: { estado: 'disponible' | 'agotado'; value: number }[] = [
    { estado: 'disponible', value: counts['disponible'] ?? 0 },
    { estado: 'agotado', value: counts['agotado'] ?? 0 },
  ];

  const width = element.clientWidth || 200;
  const height = element.clientHeight || 200;
  const radius = Math.min(width, height) / 2 - 55; // más pequeño

  const svg = d3.select(element)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const color = d3.scaleOrdinal<'disponible' | 'agotado', string>()
    .domain(['disponible', 'agotado'])
    .range(['#238bd1ff', '#F44336']);

  // Leyenda arriba derecha
  const legend = svg.append('g')
    .attr('transform', `translate(${width - 120}, 20)`); // más a la derecha

  const legendItems = legend.selectAll('.legend-item')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 26})`);

  legendItems.append('rect')
    .attr('width', 13)
    .attr('height', 13)
    .attr('fill', d => color(d.estado));

  legendItems.append('text')
    .attr('x', 20)
    .attr('y', 12)
    .text(d => `${d.estado} (${d.value})`)
    .style('font-size', '14px')
    .style('font-weight', '600')
    .style('fill', '#333');

  // Donut más arriba
  const chartGroup = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2 - 20})`);

  const pie = d3.pie<{ estado: 'disponible' | 'agotado'; value: number }>()
    .value(d => d.value);

  const arc = d3.arc<d3.PieArcDatum<{ estado: 'disponible' | 'agotado'; value: number }>>()
    .innerRadius(radius * 0.5)
    .outerRadius(radius);

  chartGroup.selectAll('path')
    .data(pie(data))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.estado))
    .attr('stroke', '#fff')
    .attr('stroke-width', 1);
}

}
