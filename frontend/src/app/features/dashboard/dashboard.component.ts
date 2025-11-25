import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements AfterViewInit {
  // Referencias a los contenedores de cada gráfico
  @ViewChild('bar', { static: true }) barRef!: ElementRef;
  @ViewChild('line', { static: true }) lineRef!: ElementRef;
  @ViewChild('donut', { static: true }) donutRef!: ElementRef;

  // Se ejecuta después de que la vista esté inicializada
  ngAfterViewInit() {
    // Gráfico de barras: Clientes vs Leads
    this.barChart(this.barRef.nativeElement, [
      { name: 'Clientes', value: 128 },
      { name: 'Leads', value: 23 },
    ]);

    // Gráfico de línea: Ventas semanales
    this.lineChart(this.lineRef.nativeElement, [5, 7, 3, 9, 6, 8, 4]);

    // Gráfico de donut: Estado del stock
    this.donutChart(this.donutRef.nativeElement, [
      { name: 'Activo', value: 70 },
      { name: 'Bajo', value: 20 },
      { name: 'Crítico', value: 10 },
    ]);
  }

  /**
   * Gráfico de barras
   * @param el Elemento HTML donde se renderiza
   * @param data Datos con nombre y valor
   */
  private barChart(el: HTMLElement, data: { name: string; value: number }[]) {
    const w = el.clientWidth, h = el.clientHeight, m = { t: 10, r: 10, b: 20, l: 30 };
    const svg = d3.select(el).append('svg').attr('width', w).attr('height', h);

    const x = d3.scaleBand().domain(data.map(d => d.name)).range([m.l, w - m.r]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value)!]).range([h - m.b, m.t]);

    svg.selectAll('rect').data(data).enter().append('rect')
      .attr('x', d => x(d.name)!)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => (h - m.b) - y(d.value))
      .attr('fill', '#3056d3'); // Azul corporativo
  }

  /**
   * Gráfico de línea
   * @param el Elemento HTML donde se renderiza
   * @param values Valores numéricos de la serie
   */
  private lineChart(el: HTMLElement, values: number[]) {
    const w = el.clientWidth, h = el.clientHeight, m = { t: 10, r: 10, b: 20, l: 30 };
    const x = d3.scaleLinear().domain([0, values.length - 1]).range([m.l, w - m.r]);
    const y = d3.scaleLinear().domain([0, d3.max(values)!]).range([h - m.b, m.t]);

    const svg = d3.select(el).append('svg').attr('width', w).attr('height', h);
    const line = d3.line<number>().x((_, i) => x(i)).y(d => y(d));

    svg.append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', '#1e3aa8') // Azul oscuro
      .attr('stroke-width', 2)
      .attr('d', line);

    svg.selectAll('circle').data(values).enter().append('circle')
      .attr('cx', (_, i) => x(i))
      .attr('cy', d => y(d))
      .attr('r', 3)
      .attr('fill', '#1e3aa8');
  }

  /**
   * Gráfico de donut
   * @param el Elemento HTML donde se renderiza
   * @param data Datos con nombre y valor
   */
  private donutChart(el: HTMLElement, data: { name: string; value: number }[]) {
    const w = el.clientWidth, h = el.clientHeight, r = Math.min(w, h) / 2 - 10;
    const svg = d3.select(el).append('svg').attr('width', w).attr('height', h)
      .append('g').attr('transform', `translate(${w / 2}, ${h / 2})`);

    const pie = d3.pie<{ name: string; value: number }>().value(d => d.value)(data);
    const arc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>().innerRadius(r * 0.6).outerRadius(r);

    const color = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(['#3056d3', '#64748b', '#ef4444']); // Azul, gris y rojo

    svg.selectAll('path').data(pie).enter().append('path')
      .attr('d', arc as any)
      .attr('fill', d => color(d.data.name) as string);
  }
}
