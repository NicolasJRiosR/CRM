import { Component, Input, ElementRef, ViewChild, OnChanges } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-crecimiento-clientes-char',
  standalone: true,
  imports: [],
  templateUrl: './crecimiento-clientes-char.component.html',
  styleUrls: ['./crecimiento-clientes-char.component.css']
})
export class CrecimientoClientesCharComponent implements OnChanges {
  @Input() serie: { date: Date; value: number }[] = [];
  @ViewChild('line', { static: true }) line!: ElementRef;

  ngOnChanges() {
    if (!this.serie?.length) return;

    const data = this.serie
      .map(d => ({
        date: d.date instanceof Date ? d.date : new Date(d.date),
        value: Number(d.value) || 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // ✅ ordena por fecha

    this.renderClientsGrowthLine(this.line.nativeElement, data);
  }

  private toLocalDate(date: Date | string): Date {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0); // fija mediodía para evitar saltos UTC/DST
    return d;
  }

  private toDayLocalKey(date: Date | string): string {
    const d = this.toLocalDate(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private daysRangeLocal(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    d.setHours(12, 0, 0, 0);
    last.setHours(12, 0, 0, 0);

    while (d <= last) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  private buildNewClientsDailySeries(clientes: any[]): { date: Date; value: number }[] {
    const today = new Date();
    today.setHours(12,0,0,0);
    
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    start.setHours(12,0,0,0);

    const counts: Record<string, number> = {};
    clientes.forEach(c => {
      if (!c.fechaRegistro) return;
      const d = this.toLocalDate(c.fechaRegistro);
      const key = this.toDayLocalKey(d);
      counts[key] = (counts[key] || 0) + 1;
    });

    return this.daysRangeLocal(start, today).map(d => {
      const key = this.toDayLocalKey(d);
      return { date: d, value: counts[key] || 0 };
    });
  }

  private renderClientsGrowthLine(el: HTMLElement, data: { date: Date; value: number }[]) {
    d3.select(el).selectAll('*').remove();

    const w = 470;
    const h = 290;
    const m = { t: 8, r: 8, b: 40, l: 40 };
    const maxY = Math.max(d3.max(data, d => d.value) ?? 0, 10);

    const svg = d3.select(el).append('svg')
      .attr('width', w)
      .attr('height', h);

    const g = svg.append('g')
      .attr('transform', 'translate(-21, 0)');

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([m.l, w - m.r]);

    const y = d3.scaleLinear()
      .domain([0, maxY])
      .range([h - m.b, m.t]);

    const yAxis = d3.axisLeft<number>(y)
      .tickValues(d3.range(2, maxY + 2, 2))
      .tickFormat(d3.format('d'));

    g.append('g')
      .attr('transform', `translate(${m.l}, 0)`)
      .call(yAxis);

    // ✅ Texto explicativo debajo
    svg.append('text')
      .attr('x', w / 2)
      .attr('y', h - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#555')
      .text('Cada punto representa los nuevos clientes añadidos ese día');

    const line = d3.line<{ date: Date; value: number }>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3056d3')
      .attr('stroke-width', 2)
      .attr('d', line);

    // ✅ Tooltip
    const tooltip = d3.select(el)
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
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.value))
      .attr('r', 3)
      .attr('fill', '#1e3aa8')
      .on('mouseover', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d3.timeFormat('%d %b')(d.date)}</strong><br/>
            Clientes añadidos: ${d.value}
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });
  }
}
