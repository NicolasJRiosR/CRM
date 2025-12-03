import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-grafico-burbujas-char',
  standalone: true,
  imports: [],
  templateUrl: './grafico-burbujas-char.component.html',
  styleUrl: './grafico-burbujas-char.component.css',
})
export class GraficoBurbujasCharComponent {
  @Input() products: {
    nombre: string;
    precio: number;
    vendidos: number;
    stock: number;
  }[] = [];
  @ViewChild('bubble', { static: true }) bubble!: ElementRef;

  ngOnChanges() {
    console.log(
      '[Burbujas] ngOnChanges triggered. Products:',
      this.products?.length,
      this.products,
    );
    if (!this.products?.length) return;
    this.renderBubbleChart(this.bubble.nativeElement, [...this.products]);
  }

  private renderBubbleChart(element: HTMLElement, products: any[]) {
    d3.select(element).html(''); // Limpiar gráfico

    const data = products.sort((a, b) => b.vendidos - a.vendidos).slice(0, 10);

    const containerWidth = element.clientWidth;
    const containerHeight = element.clientHeight;
    const margin = { top: 60, right: 20, bottom: 60, left: 60 };

    const isMobile = containerWidth < 768;

    // Ancho del SVG: en mobile lo hacemos más ancho que el contenedor para scroll
    const width = isMobile ? containerWidth * 1.8 : containerWidth;
    const height = containerHeight;

    const yMax = d3.max(data, (d) => d.vendidos)!;

    const svg = d3
      .select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet');

    // Escalas
    const x = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.precio)! * 0.9,
        d3.max(data, (d) => d.precio)! * 1.1,
      ])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .range([height - margin.bottom, margin.top]);

    const r = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.stock)!])
      .range([8, 40]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Ejes
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format('d'));
    const xAxis = d3.axisBottom(x).ticks(5);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .append('text')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .attr('fill', '#000')
      .text('Unidades vendidas');

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .attr('fill', '#000')
      .text('Precio (€)');

    // Tooltip
    const tooltip = d3
      .select(element)
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '6px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Burbujas
    svg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.precio))
      .attr('cy', (d) => y(d.vendidos))
      .attr('r', (d) => r(d.stock))
      .attr('fill', (d, i) => color(i.toString()))
      .attr('opacity', 0.7)
      .on('mouseover', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${d.nombre}</strong><br/>Precio: ${d.precio}€<br/>Vendidos: ${d.vendidos}<br/>Stock: ${d.stock}`,
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => tooltip.style('opacity', 0));
  }
}
