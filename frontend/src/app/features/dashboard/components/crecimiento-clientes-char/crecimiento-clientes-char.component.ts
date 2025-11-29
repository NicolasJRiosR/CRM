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
    this.renderClientsGrowthLine(this.line.nativeElement, this.serie);
  }

  private daysRange(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    const d = new Date(start);
    d.setHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setHours(0, 0, 0, 0);

    while (d <= last) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  private toDay(date: Date | string): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }

  private buildNewClientsDailySeries(clientes: any[]): { date: Date; value: number }[] {
    const today = new Date();
    const start = new Date();
    start.setMonth(today.getMonth() - 1);

    const counts: Record<string, number> = {};
    clientes.forEach(c => {
      if (!c.fechaRegistro) return;
      const key = this.toDay(c.fechaRegistro);
      counts[key] = (counts[key] || 0) + 1;
    });

    return this.daysRange(start, today).map(d => {
      const key = this.toDay(d);
      return { date: d, value: counts[key] || 0 };
    });
  }

  private renderClientsGrowthLine(el: HTMLElement, data: { date: Date; value: number }[]) {
    d3.select(el).selectAll('*').remove();

    const w = 470; 
    const h = 290;
    const m = { t: 8, r: 8, b: 20, l: 40 };
    const maxY = Math.max(d3.max(data, d => d.value) ?? 0, 10);

    const svg = d3.select(el).append('svg')
      .attr('width', w)
      .attr('height', h);

    const g = svg.append('g')
      .attr('transform', 'translate(-21, 0)');

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([m.l, w - m.r ]);

    const firstDate = data[0].date;
    const lastDate = data[data.length - 1].date;
    const ticks = d3.timeDay.range(firstDate, lastDate, 4);
    const tickValues = [firstDate, ...ticks, lastDate];

    const xAxis = d3.axisBottom<Date>(x)
      .tickValues(tickValues)
      .tickFormat(d3.timeFormat('%d %b') as any);

    const y = d3.scaleLinear()
      .domain([0, maxY])
      .range([h - m.b, m.t]);

    const yAxis = d3.axisLeft<number>(y)
      .tickValues(d3.range(2, maxY + 2, 2))
      .tickFormat(d3.format('d'));

    g.append('g')
      .attr('transform', `translate(0, ${h - m.b})`)
      .call(xAxis);

    g.append('g')
      .attr('transform', `translate(${m.l}, 0)`)
      .call(yAxis);

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

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.value))
      .attr('r', 3)
      .attr('fill', '#1e3aa8');
  }
}
