import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  HostListener,
  EventEmitter,
  Output,
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
  @Output() solicitarRefresco = new EventEmitter<void>();

  //FILTRADO DEL GRAFICO
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

  anios = [2025, 2026];

  // FILTRADO INTERNO
  filtrarDesdeComponente() {

  //LIMPIAR SIEMPRE ANTES DE FILTRAR
  this.mensajeInfo = null;

  //FILTRADO
  this.serieFiltrada = this.serie.filter((d) => {
    const [yearStr, monthStr] = d.date.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    return month === this.mesSeleccionado && year === this.anoSeleccionado;
  });

  d3.select(this.line.nativeElement).selectAll('*').remove();

  if (this.serieFiltrada.length === 0) {
    this.mensajeInfo = "No hay clientes para este periodo.";
    return;
  }
  this.redibujar();
}

  ngOnChanges() {

    this.mensajeInfo = null;
    d3.select(this.line.nativeElement).selectAll("*").remove();

    if (!this.serie?.length) {
      return;
    }

    if (this.serieFiltrada.length === 0) {
      this.filtrarDesdeComponente();
    }
  }

  onCambioMesAno() {
    this.filtrarDesdeComponente();
  }

  @HostListener('window:resize')
  onResize() {
    this.redibujar();
  }

  private isMobile(): boolean {
    return window.innerWidth < 768;
  }

  getNombreMes(m: number): string {
    const nombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return nombres[m - 1] ?? '';
  }
 
  private redibujar() {
    const el = this.line.nativeElement;  

    // Limpiar antes de dibujar
    d3.select(el).selectAll('*').remove();
    d3.select(el).select('svg').remove();

    // Si no hay datos, no dibujar nada
    if (!this.serieFiltrada.length) return;

    // Agrupar por día (usando la fecha como string YYYY-MM-DD)
    const counts: Record<string, number> = {};
    this.serieFiltrada.forEach((d) => {
      counts[d.date] = (counts[d.date] || 0) + 1;
    });

  const year = this.anoSeleccionado;
    const month = this.mesSeleccionado;

    // último día del mes seleccionado
    const lastDay = new Date(year, month, 0).getDate();

    const data: { date: Date; value: number }[] = [];

    for (let day = 1; day <= lastDay; day++) {
      const key =
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // YYYY-MM-DD

      data.push({
        // fecha LOCAL sin UTC de por medio
        date: new Date(year, month - 1, day),
        value: counts[key] || 0,
      });

  }

  if (this.isMobile()) {
    this.renderMobileChart(el, data);
  } else {
    this.renderDesktopChart(el, data);
  }
}


  // ---------------- Desktop ----------------
  private renderDesktopChart(
    el: HTMLElement,
    data: { date: Date; value: number }[],
  ) {
    d3.select(el).selectAll('*').remove();

    const isDark = document.documentElement.classList.contains('dark');

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
        d3.axisLeft<number>(y)
          .tickValues(d3.range(2, maxY + 2, 2))
          .tickFormat(d3.format('d')),
      )
      .selectAll('text')
      .style('fill', isDark ? '#ffffff' : '#000000');

    svg
      .append('text')
      .attr('x', w / 2)
      .attr('y', h - 5)
      .attr('text-anchor', 'middle')
      .attr('style', `fill:${isDark ? '#ffffff' : '#000000'} !important`)
      .style('font-size', '13px')
      .style('stroke', 'none')
      .style('paint-order', 'normal')
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

    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '6px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.value))
      .attr('r', 3)
      .attr('fill', '#1e3aa8')
      .on('mouseover', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${d3.timeFormat('%d %b')(d.date)}</strong><br/>Clientes añadidos: ${d.value}`,
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => tooltip.style('opacity', 0));
  }

  // ---------------- Mobile ----------------
  private renderMobileChart(
    el: HTMLElement,
    data: { date: Date; value: number }[],
  ) {
    d3.select(el).selectAll('*').remove();

    const isDark = document.documentElement.classList.contains('dark'); 

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
    console.log("EJE X:", d3.extent(data, (d) => d.date));

    const y = d3
      .scaleLinear()
      .domain([0, maxY])
      .range([h - m.b, m.t]);

    g.append('g')
      .attr('transform', `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('fill', isDark ? '#ffffff' : '#000000');

    svg
      .append('text')
      .attr('x', w / 2)
      .attr('y', h - 5)
      .attr('text-anchor', 'middle')
      .attr('style', `fill:${isDark ? '#ffffff' : '#000000'} !important`)
      .style('font-size', '13px')
      .style('stroke', 'none')
      .style('paint-order', 'normal')
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

    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '6px')
      .style('border-radius', '4px')
      .style('font-size', '10px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.value))
      .attr('r', 3)
      .attr('fill', '#1e3aa8')
      .on('mouseover', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${d3.timeFormat('%d %b')(d.date)}</strong><br/>Clientes añadidos: ${d.value}`,
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => tooltip.style('opacity', 0));
  }
}
