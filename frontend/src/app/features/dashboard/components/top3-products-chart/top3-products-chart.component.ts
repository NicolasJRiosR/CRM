import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-top3-products-chart',
  standalone: true,
  imports: [],
  templateUrl: './top3-products-chart.component.html',
  styleUrl: './top3-products-chart.component.css'
})
export class Top3ProductsChartComponent {
  @Input() series: any[] = [];
  @Input() keys: string[] = [];
  @ViewChild('top', { static: true }) top!: ElementRef;

  ngOnChanges() {
    if (!this.series?.length || !this.keys?.length) return;
    this.renderTopProductsLineChart(this.top.nativeElement, this.series, this.keys);
  }


  // gráfico comparativa productos top 3 (líneas sin relleno)
  private renderTopProductsLineChart(el: HTMLElement, data: any[], keys: string[]) {
    d3.select(el).selectAll('*').remove();

    const w = Math.min(el.clientWidth, 500);
    const h = 300;
    const m = { t: 20, r: 20, b: 30, l: 40 };

    const svg = d3.select(el).append('svg')
      .attr('width', w)
      .attr('height', h);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.fecha)) as [Date, Date])
      .range([m.l, w - m.r]);

    const maxVentas = d3.max(data, d => keys.reduce((sum, k) => sum + d[k], 0)) || 0;
    const limite = Math.max(30, maxVentas);

    const y = d3.scaleLinear()
      .domain([0, limite])
      .range([h - m.b, m.t]);

    const color = d3.scaleOrdinal<string>()
      .domain(keys)
      .range(["#3ae03fff", "#369acdff", "#e25d49ff"]);

    // Dibujar una línea por cada producto
    keys.forEach(key => {
      const line = d3.line<any>()
        .x(d => x(new Date(d.fecha)))
        .y(d => y(d[key]))
        .curve(d3.curveMonotoneX);

      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color(key))
        .attr("stroke-width", 2)
        .attr("d", line);
    });

    // Ejes
    svg.append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(d3.axisBottom(x)
        .ticks(d3.timeDay.every(1))
        .tickFormat(d3.timeFormat("%d %b") as any));

    svg.append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y)
        .tickValues(d3.range(0, y.domain()[1] + 1, 5))
        .tickFormat(d3.format('d')));
  }

}
