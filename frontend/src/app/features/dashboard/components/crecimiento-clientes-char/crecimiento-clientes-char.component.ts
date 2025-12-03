import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  HostListener,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-crecimiento-clientes-char',
  standalone: true,
  imports: [],
  templateUrl: './crecimiento-clientes-char.component.html',
  styleUrls: ['./crecimiento-clientes-char.component.css'],
})
export class CrecimientoClientesCharComponent implements OnChanges {
  @Input() serie: { date: Date; value: number }[] = [];
  @ViewChild('line', { static: true }) line!: ElementRef;

  ngOnChanges() {
    if (!this.serie?.length) return;

    const data = this.serie
      .map((d) => ({
        date: d.date instanceof Date ? d.date : new Date(d.date),
        value: Number(d.value) || 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (this.isMobile()) {
      this.renderMobileChart(this.line.nativeElement, data);
    } else {
      this.renderDesktopChart(this.line.nativeElement, data);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.ngOnChanges(); // re-renderiza según el tamaño actual
  }

  private isMobile(): boolean {
    return window.innerWidth < 768;
  }

  // ---------------- Desktop ----------------
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

    // Texto explicativo
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

    // Tooltip
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

    const w = el.offsetWidth; // ancho del contenedor móvil
    const h = w * 0.6; // altura proporcional
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

    // Texto explicativo
    svg
      .append('text')
      .attr('x', w / 2)
      .attr('y', h - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
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

    // Tooltip
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
