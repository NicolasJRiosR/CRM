import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

@Component({
  selector: 'app-stock-disponible-char',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './stock-disponible-char.component.html',
  styleUrl: './stock-disponible-char.component.css',
})
export class StockDisponibleCharComponent {
  @Input() counts: Record<'disponible' | 'agotado', number> = {
    disponible: 0,
    agotado: 0,
  };

  @Input() products: { nombre: string; stock: number }[] = [];

  @ViewChild('donut', { static: true }) donut!: ElementRef;

  modo: number = 1;

  ngOnChanges() {
    this.aplicarModo();
  }

  aplicarModo() {
    if (!this.products || !this.counts) return;

    let data: any[] = [];

    if (this.modo === 1) {
      data = [
        { label: 'Disponible', value: this.counts.disponible,},
        { label: 'Agotado', value: this.counts.agotado },
      ];

    }

    if (this.modo === 2) {
      data = this.products
        .filter(p => p.stock > 0)
        .sort((a, b) => b.stock - a.stock)   
        .map(p => ({
          label: p.nombre,
          value: p.stock,
          stockReal: p.stock
        }));
    }

    if (this.modo === 3) {
      data = this.products
        .filter(p => p.stock === 0)
        .map(p => ({
          label: p.nombre,
          value: 1,
          stockReal: 0
        }));
    }

    this.renderDonut(this.donut.nativeElement, data);
  }

  private renderDonut(element: HTMLElement, data: any[]) {
    d3.select(element).selectAll('*').remove();

    const width = element.clientWidth;
    const height = element.clientHeight;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = d3
      .select(element)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%');

    let color: d3.ScaleOrdinal<string, string>;

    if (this.modo === 1) {
      // MODO 1: colores fijos
      color = d3.scaleOrdinal<string, string>()
        .domain(['Disponible', 'Agotado'])
        .range(['#238bd1', '#EF4444']);
    } else {
      // MODO 2 y 3: colores infinitos sin repetición
      const total = data.length;

      const generatedColors = data.map((_, i) => {
        const hue = (i * 360 / total); // reparto uniforme
        return `hsl(${hue}, 70%, 55%)`; // saturación y luminosidad fijas
      });

      color = d3.scaleOrdinal<string, string>()
        .domain(data.map(d => d.label))
        .range(generatedColors);
    }

    if (this.modo === 1) {
      const legend = svg.append('g')
        .attr('transform', `translate(${width * 0.78}, ${height / 10})`);

      const legendData = [
        { label: 'Disponible', color: '#238bd1' },
        { label: 'Sin stock', color: '#EF4444' }
      ];

      const items = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (_, i) => `translate(0, ${i * 22})`);

      items.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', d => d.color);

      items.append('text')
        .attr('x', 22)
        .attr('y', 12)
        .style('font-size', '14px')
        .style('fill', '#333')
        .text(d => d.label);
    }

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3
      .pie<any>()
      .value(d => d.value)
      .sort(null);

    const arc = d3
      .arc<any>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    const tooltip = d3
      .select(element)
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '6px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    const self = this;
    const rect = element.getBoundingClientRect(); 

    chartGroup
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label) as string)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function (event, d) {
        let html = `<strong>${d.data.label}</strong><br/>`;

        if (self.modo === 1) {
          html += `Total: ${d.data.value}`;
        } else {
          html += `Stock: ${d.data.stockReal}`;
        }

        tooltip
          .style('opacity', 1)
          .html(html)
          .style('left', event.clientX - rect.left + 10 + 'px')
          .style('top', event.clientY - rect.top - 28 + 'px');
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

  }
}
