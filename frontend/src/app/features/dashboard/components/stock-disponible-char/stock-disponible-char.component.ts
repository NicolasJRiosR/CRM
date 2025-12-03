import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  standalone: true,
  selector: 'app-stock-disponible-char',
  templateUrl: './stock-disponible-char.component.html',
  styleUrls: ['./stock-disponible-char.component.css'],
})
export class StockDisponibleCharComponent implements OnChanges, AfterViewInit {
  @Input() counts: Record<'disponible' | 'agotado', number> = {
    disponible: 0,
    agotado: 0,
  };
  @ViewChild('donut', { static: true }) donut!: ElementRef;

  private data: { estado: 'disponible' | 'agotado'; value: number }[] = [];
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null =
    null;

  ngAfterViewInit() {
    this.updateData();
    this.renderChart();
  }

  ngOnChanges() {
    this.updateData();
    this.renderChart();
  }

  @HostListener('window:resize')
  onResize() {
    this.renderChart();
  }

  private updateData() {
    if (!this.counts) return;
    this.data = [
      { estado: 'disponible', value: this.counts['disponible'] ?? 0 },
      { estado: 'agotado', value: this.counts['agotado'] ?? 0 },
    ];
  }

  private renderChart() {
    const element = this.donut.nativeElement as HTMLElement;

    // Limpiar gráfico previo
    d3.select(element).selectAll('*').remove();

    const width = element.clientWidth;
    const height = element.clientHeight || 300; // fallback si height=0
    if (width === 0 || height === 0) return;

    const radius = Math.min(width, height) / 2 - 40;

    this.svg = d3
      .select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const color = d3
      .scaleOrdinal<'disponible' | 'agotado', string>()
      .domain(['disponible', 'agotado'])
      .range(['#238bd1ff', '#F44336']);

    // Leyenda
    const isMobile = width <= 768;
    const marginRight = 20;
    const legendX = width - (isMobile ? 90 : 120) - marginRight;

    const legend = this.svg
      .append('g')
      .attr('transform', `translate(${legendX}, 10)`);

    const legendItems = legend
      .selectAll<
        SVGGElement,
        { estado: 'disponible' | 'agotado'; value: number }
      >('.legend-item')
      .data(this.data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 22})`);

    legendItems
      .append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', (d) => color(d.estado));

    legendItems
      .append('text')
      .attr('x', 18)
      .attr('dy', '0.9em') // mejor alineación vertical
      .text((d) => `${d.estado} (${d.value})`)
      .style('font-size', isMobile ? '12px' : '14px')
      .style('font-weight', '600')
      .style('fill', '#333');

    // Grupo del gráfico centrado
    const chartGroup = this.svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3
      .pie<{ estado: 'disponible' | 'agotado'; value: number }>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<
        d3.PieArcDatum<{ estado: 'disponible' | 'agotado'; value: number }>
      >()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    const arcs = chartGroup
      .selectAll<
        SVGPathElement,
        d3.PieArcDatum<{ estado: 'disponible' | 'agotado'; value: number }>
      >('path')
      .data(pie(this.data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.estado))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    // Texto dentro del donut
    chartGroup
      .selectAll('text')
      .data(pie(this.data))
      .enter()
      .append('text')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text((d) => d.data.value)
      .style('fill', '#fff')
      .style('font-size', '14px')
      .style('font-weight', 'bold');
  }
}
