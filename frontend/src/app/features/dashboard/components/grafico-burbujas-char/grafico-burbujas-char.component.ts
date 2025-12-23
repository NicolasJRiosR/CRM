import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-grafico-burbujas-char',
  standalone: true,
  templateUrl: './grafico-burbujas-char.component.html',
  styleUrl: './grafico-burbujas-char.component.css',
})
export class GraficoBurbujasCharComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() products: {
    nombre: string;
    precio: number;
    vendidos: number;
    stock: number;
    proveedor: string;
  }[] = [];

  @ViewChild('bubble', { static: true }) bubble!: ElementRef;

  private resizeObserver!: ResizeObserver;
  private darkModeObserver!: MutationObserver;

  ngAfterViewInit() {
    // Redibujar al cambiar tamaño
    this.resizeObserver = new ResizeObserver(() => {
      if (this.products?.length) {
        this.renderBubbleChart(this.bubble.nativeElement, [...this.products]);
      }
    });
    this.resizeObserver.observe(this.bubble.nativeElement);

    // Redibujar al cambiar modo oscuro
    this.darkModeObserver = new MutationObserver(() => {
      if (this.products?.length) {
        this.renderBubbleChart(this.bubble.nativeElement, [...this.products]);
      }
    });

    this.darkModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  ngOnChanges() {
    if (!this.products?.length) return;
    this.renderBubbleChart(this.bubble.nativeElement, [...this.products]);
  }

  ngOnDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.darkModeObserver) this.darkModeObserver.disconnect();
  }

  private renderBubbleChart(element: HTMLElement, products: any[]) {
    d3.select(element).html('');

    const data = products.sort((a, b) => b.vendidos - a.vendidos).slice(0, 10);

    const width = element.clientWidth;
    const height = element.clientHeight || 500;

    const margin = { top: 60, right: 20, bottom: 40, left: 50 };

    const yMax = Math.max(35, d3.max(data, (d) => d.vendidos)!);

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#ffffff' : '#000000';
    const legendTextColor = isDark ? '#ffffff' : '#333333';

    const tooltipBg = isDark ? '#1f2937' : '#ffffff';
    const tooltipText = isDark ? '#f3f4f6' : '#111827';
    const tooltipBorder = isDark ? '#4b5563' : '#d1d5db';

    const svg = d3
      .select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const x = d3.scaleLinear().domain([90, 200]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, yMax]).range([height - margin.bottom, margin.top]);

    const r = d3.scaleSqrt().domain([0, d3.max(data, (d) => d.stock)!]).range([5, width * 0.04]);

    const proveedores = Array.from(new Set(data.map((d) => d.proveedor)));

    const color = d3.scaleOrdinal<string>()
      .domain(proveedores)
      .range([
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
        '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
        '#6366F1', '#22C55E',
      ]);

    // LEYENDA
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, ${margin.top - 50})`);

    legend.selectAll('legend-item')
      .data(proveedores)
      .enter()
      .append('g')
      .attr('transform', (_, i) => `translate(0, ${i * 20})`)
      .each(function (prov) {
        const g = d3.select(this);

        g.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', color(prov))
          .attr('stroke', isDark ? '#aaa' : '#333');

        g.append('text')
          .attr('x', 18)
          .attr('y', 10)
          .style('font-size', '12px')
          .style('fill', legendTextColor)
          .text(prov);
      });

    const xAxis = d3.axisBottom(x).ticks(10).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(y).tickValues(d3.range(0, yMax + 1, 5)).tickFormat(d3.format('d'));

    // EJE Y
    const yAxisGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);

    yAxisGroup.selectAll('text').style('fill', textColor);

    yAxisGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('fill', textColor)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Unidades vendidas');

    // TOOLTIP
    const tooltip = d3.select(element)
      .append('div')
      .style('position', 'absolute')
      .style('background', tooltipBg)
      .style('color', tooltipText)
      .style('border', `1px solid ${tooltipBorder}`)
      .style('padding', '8px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('mix-blend-mode', 'normal')
      .style('box-shadow', isDark ? '0 4px 10px rgba(0,0,0,0.6)' : '0 4px 10px rgba(0,0,0,0.15)')
      .style('transition', 'opacity 0.15s ease')
      .style('opacity', 0);

    // EJE X
    const xAxisGroup = svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    xAxisGroup.selectAll('text').style('fill', textColor);

    xAxisGroup.append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('fill', textColor)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Precio (€)');

    // BURBUJAS
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.precio))
      .attr('cy', (d) => y(d.vendidos))
      .attr('r', (d) => r(d.stock))
      .attr('fill', (d) => color(d.proveedor))
      .attr('opacity', 0.7)
      .on('mouseover', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.nombre}</strong><br/>
            Precio: ${d.precio}€ <br/>
            Vendidos: ${d.vendidos}<br/>
            Stock: ${d.stock}
          `)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });
  }
}
