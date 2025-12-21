import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

@Component({
  selector: 'app-crecimiento-clientes-char',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './crecimiento-clientes-char.component.html',
  styleUrls: ['./crecimiento-clientes-char.component.css'],
})
export class CrecimientoClientesCharComponent implements OnChanges {
  @Input() serie: { date: string; value: number }[] = [];
  serieFiltrada: { date: string; value: number }[] = [];

  @ViewChild('line', { static: true }) line!: ElementRef;

  mesSeleccionado = new Date().getMonth() + 1;
  anoSeleccionado = new Date().getFullYear();

  mensajeInfo: string | null = null;

  meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // ---------------- FILTRADO ----------------
  filtrarDesdeComponente() {
    this.mensajeInfo = null;

    this.serieFiltrada = this.serie.filter((d) => {
      const [yearStr, monthStr] = d.date.split('-');
      const year = Number(yearStr);
      const month = Number(monthStr);
      return month === this.mesSeleccionado && year === this.anoSeleccionado;
    });

    d3.select(this.line.nativeElement).selectAll('*').remove();

    if (this.serieFiltrada.length === 0) {
      this.mensajeInfo = 'No hay clientes para este periodo.';
      return;
    }

    this.redibujar();
  }

  // ---------------- INICIALIZACIÓN ----------------
  ngOnChanges() {
    if (!this.serie?.length) return;

    // Primera carga → mostrar todo
    if (!this.serieFiltrada.length) {
      this.serieFiltrada = [...this.serie];
      this.redibujar();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.redibujar();
  }

  private isMobile(): boolean {
    return window.innerWidth < 768;
  }

  // ---------------- REDIBUJAR ----------------
  private redibujar() {
    const el = this.line.nativeElement;

    d3.select(el).selectAll('*').remove();
    d3.select(el).select('svg').remove();

    if (!this.serieFiltrada.length) return;

    // Agrupar por día
    const counts: Record<string, number> = {};
    this.serieFiltrada.forEach((d) => {
      counts[d.date] = (counts[d.date] || 0) + 1;
    });

    // Rellenar todos los días del mes
    const start = new Date(this.anoSeleccionado, this.mesSeleccionado - 1, 1);
    const end = new Date(this.anoSeleccionado, this.mesSeleccionado, 0);

    const data: { date: Date; value: number }[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);

      // ← CONSTRUCCIÓN LOCAL SIN ZONA HORARIA
      const [y, m, dd] = key.split('-').map(Number);

      data.push({
        date: new Date(y, m - 1, dd),
        value: counts[key] || 0,
      });
    }

    if (this.isMobile()) {
      this.renderMobileChart(el, data);
    } else {
      this.renderDesktopChart(el, data);
    }
  }

  // ---------------- DESKTOP ----------------
  private renderDesktopChart(
    el: HTMLElement,
    data: { date: Date; value: number }[],
  ) {
    d3.select(el).selectAll('*').remove();

    const w = 470;
    const h = 290;
    const m = { t: 8, r: 8, b: 40, l: 40 };
    const maxY = Math.max(d3.max(data, (d) => d.value) ?? 0, 10);

    const svg = d3.select(el).append('svg').attr('width', w).attr('height', h);
    const g = svg.append('g').attr('transform', 'translate(-21, 0)');

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([m.l, w - m.r]);

    const y = d3
      .scaleLinear()
      .domain([0, maxY])
      .range([h - m.b, m.t]);

    g.append('g')
      .attr('transform', `translate(${m.l}, 0)`)
      .call(
        d3
          .axisLeft<number>(y)
          .tickValues(d3.range(2, maxY + 2, 2))
          .tickFormat(d3.format('d')),
      );

    svg
      .append('text')
      .attr('x', w / 2)
      .attr('y', h - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#555')
      .text('Cada punto representa los nuevos clientes añadidos ese día');

    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3056d3')
      .attr('stroke-width', 2)
      .attr('d', line);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.value))
      .attr('r', 3)
      .attr('fill', '#1e3aa8');
  }

  // ---------------- MOBILE ----------------
  private renderMobileChart(
    el: HTMLElement,
    data: { date: Date; value: number }[],
  ) {
    d3.select(el).selectAll('*').remove();

    const w = el.offsetWidth;
    const h = w * 0.6;
    const m = { t: 8, r: 8, b: 30, l: 30 };
    const maxY = Math.max(d3.max(data, (d) => d.value) ?? 0, 10);

    const svg = d3.select(el).append('svg').attr('width', w).attr('height', h);
    const g = svg.append('g');

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([m.l, w - m.r]);

    const y = d3
      .scaleLinear()
      .domain([0, maxY])
      .range([h - m.b, m.t]);

    g.append('g')
      .attr('transform', `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(5));

    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3056d3')
      .attr('stroke-width', 2)
      .attr('d', line);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.value))
      .attr('r', 3)
      .attr('fill', '#1e3aa8');
  }
}
