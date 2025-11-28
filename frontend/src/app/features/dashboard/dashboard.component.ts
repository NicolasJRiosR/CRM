import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';


type MetricKey =
  | 'clientesTotales'
  | 'clientesNuevosMes'
  | 'productosCatalogo'
  | 'stockBajoAlerta'
  | 'ventasTotales'
  | 'ingresosTotales'
  | 'productoMasVendido'
  | 'interaccionesTotales'
  | 'tipoInteraccionMasComun';


@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  counts = { disponible: 0, agotado: 0 }; //necesario para el grafico del donut


  // referencias a los graficos
  @ViewChild('line', { static: true }) lineRef!: ElementRef;
  @ViewChild('donut', { static: true }) donutRef!: ElementRef;
  @ViewChild('top', { static: true }) topRef!: ElementRef;
  @ViewChild('comparativa', { static: true }) comparativaRef!: ElementRef;




  metricOrder: { key: MetricKey; name: string }[] = [
    { key: 'clientesTotales', name: 'Clientes totales' },
    { key: 'clientesNuevosMes', name: 'Clientes nuevos este mes' },
    { key: 'productosCatalogo', name: 'Productos en catálogo' },
    { key: 'stockBajoAlerta', name: 'Stock bajo alerta' },
    { key: 'ventasTotales', name: 'Ventas totales' },
    { key: 'ingresosTotales', name: 'Ingresos totales' },
    { key: 'productoMasVendido', name: 'Producto más vendido' },
    { key: 'interaccionesTotales', name: 'Interacciones totales' },
    { key: 'tipoInteraccionMasComun', name: 'Tipo de interacción más común' },
  ];


  metricValues: Partial<Record<MetricKey, any>> = {};


  constructor(private http: HttpClient) {
    this.loadMetrics();
  }


  get metrics() {
    const result = this.metricOrder.map(m => ({
      name: m.name,
      value: this.metricValues[m.key] ?? '—',
    }));
    console.log('Metrics calculados:', result);
    return result;
  }


  private loadMetrics() {
    // --- CLIENTES ---
    this.http.get<any[]>('http://localhost:9080/api/clientes').subscribe({
      next: clientes => {
        const totales = clientes.length;


        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        const nuevosMes = clientes.filter(c => new Date(c.fechaRegistro) >= haceUnMes).length;


        this.metricValues['clientesTotales'] = totales;
        this.metricValues['clientesNuevosMes'] = nuevosMes;


        const serie = this.buildNewClientsDailySeries(clientes);
        this.renderClientsGrowthLine(this.lineRef.nativeElement, serie);
      },
      error: err => console.error('Error clientes:', err)
    });


    // --- PRODUCTOS ---
    let productosCache: Record<string, any> = {};
    this.http.get<any[]>('http://localhost:9080/api/productos').subscribe({
      next: productos => {
        productosCache = productos.reduce((acc, p) => {
          acc[String(p.id ?? p.productoId)] = p;
          return acc;
        }, {} as Record<string, any>);


        const activos = productos.filter(p => p.activo).length;
        const inactivos = productos.filter(p => !p.activo).length;
        const stockBajo = productos.filter(p => (p.stock ?? 0) < 5).length;


        this.metricValues['productosCatalogo'] = productos.length;
        this.metricValues['stockBajoAlerta'] = stockBajo;


        // --- STOCK DISPONIBILIDAD (donut) ---
        this.counts = { disponible: 0, agotado: 0 };
        productos.forEach(p => {
          if (p.stock > 0) this.counts['disponible']++;
          else this.counts['agotado']++;
        });


      console.log('counts:', this.counts);
      const data = Object.entries(this.counts).map(([estado, value]) => ({ estado, value }));
      console.log('data (array):', data);


      this.renderStockDonut(this.donutRef.nativeElement, this.counts);      
    },
      error: err => console.error('Error productos:', err)
    });


    // --- VENTAS ---
    this.http.get<any[]>('http://localhost:9080/api/ventas').subscribe({
      next: ventas => {
        const ventasFalsas = [
          { id: 1, productoId: 1, fecha: "2025-11-21", cantidad: 10, precioUnitario: 1200 },
          { id: 2, productoId: 2, fecha: "2025-11-22", cantidad: 5, precioUnitario: 800 },
          { id: 3, productoId: 1, fecha: "2025-11-23", cantidad: 25, precioUnitario: 1200 },
          { id: 4, productoId: 3, fecha: "2025-11-24", cantidad: 15, precioUnitario: 500 },
          { id: 5, productoId: 2, fecha: "2025-11-25", cantidad: 19, precioUnitario: 800 },
          { id: 6, productoId: 3, fecha: "2025-11-26", cantidad: 25, precioUnitario: 1200 },
          { id: 7, productoId: 2, fecha: "2025-11-27", cantidad: 28, precioUnitario: 800 }
        ];
        // Filtrar última semana
        const hoy = new Date();
        const haceUnaSemana = new Date();
        haceUnaSemana.setDate(hoy.getDate() - 7);

        // Para pruebas, usa directamente el array ficticio
        const ventasUltimaSemana = ventasFalsas;

        // const ventasUltimaSemana = ventas.filter(v => {
        //   const fecha = new Date(v.fecha ?? v.fechaVenta ?? Date.now());
        //   return fecha >= haceUnaSemana && fecha <= hoy;
        // });

        // Métricas SOLO de la última semana
        const ventasTotales = ventasUltimaSemana.length;
        const ingresosTotales = ventasUltimaSemana.reduce(
          (sum, v) => sum + (v.cantidad * v.precioUnitario),
          0
        );

        const conteoPorProducto: Record<string, number> = {};
        ventasUltimaSemana.forEach(v => {
          const idProd = String(v.productoId ?? '');
          if (!idProd) return;
          conteoPorProducto[idProd] = (conteoPorProducto[idProd] || 0) + 1;
        });



        const topEntry = Object.entries(conteoPorProducto).sort((a, b) => b[1] - a[1])[0];
        const topId = topEntry?.[0];
        const topNombre =
          topId && productosCache[topId]?.nombre
            ? productosCache[topId].nombre
            : (topId ?? 'N/A');

        this.metricValues['ventasTotales'] = ventasTotales;
        this.metricValues['ingresosTotales'] = ingresosTotales;
        this.metricValues['productoMasVendido'] = topNombre;

        // TOP 3 productos más vendidos en la última semana
        const top3Ids = Object.entries(conteoPorProducto)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => id);

        const top3Names = top3Ids.map(id => productosCache[id]?.nombre ?? id);

        // Agrupar ventas por fecha para los top 3
        const grouped: Record<string, Record<string, number>> = {};
        ventasUltimaSemana.forEach(v => {
          const fecha = new Date(v.fecha ?? v.fecha ?? Date.now());
          const key = fecha.toISOString().slice(0, 10);
          const idProd = String(v.productoId ?? v.productoId ?? '');
          if (!top3Ids.includes(idProd)) return;

          if (!grouped[key]) grouped[key] = {};
          grouped[key][idProd] = (grouped[key][idProd] || 0) + v.cantidad;
        });

        const fechasUltimaSemana = this.daysRange(haceUnaSemana, hoy).map(d => this.toDay(d));

        const serieTop = fechasUltimaSemana.map(fecha => {
          const row: any = { fecha };
          top3Ids.forEach((id, i) => {
            const nombre = top3Names[i];
            row[nombre] = grouped[fecha]?.[id] || 0;
          });
          return row;
        });

        const keys = top3Names;
        this.renderTopProductsLineChart(this.topRef.nativeElement, serieTop, keys);
      },
      error: err => console.error('Error ventas:', err)
    });


    // --- INTERACCIONES ---
    this.http.get<any[]>('http://localhost:9080/api/interacciones').subscribe({
      next: interacciones => {
        const total = interacciones.length;


        const conteoTipos: Record<string, number> = {};
        interacciones.forEach(i => {
          const tipo = String(i.tipo ?? 'desconocido');
          conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
        });
        const tipoMasComun = Object.entries(conteoTipos).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';


        this.metricValues['interaccionesTotales'] = total;
        this.metricValues['tipoInteraccionMasComun'] = tipoMasComun;
      },
      error: err => console.error('Error interacciones:', err)
    });
   
    // --- COMPRAS ---
    this.http.get<any[]>('http://localhost:9080/api/compras').subscribe({
      next: compras => {
        // --- VENTAS (para comparativa) ---
        this.http.get<any[]>('http://localhost:9080/api/ventas').subscribe({
          next: ventas => {
            // Construir series
            const comprasSerie = compras.map(c => ({
              date: new Date(c.fecha ?? c.fechaCompra ?? Date.now()),
              value: c.total ?? c.monto ?? 1
            }));


            const ventasSerie = ventas.map(v => ({
              date: new Date(v.fecha ?? v.fechaVenta ?? Date.now()),
              value: v.total ?? v.monto ?? 1
            }));
          },
          error: err => console.error('Error ventas (comparativa):', err)
        });
      },
      error: err => console.error('Error compras:', err)
    });
  }

  // gráfico de línea para crecimiento de clientes
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


    const w = Math.min(el.clientWidth, 450);
    const h = 290;
    const m = { t: 8, r: 8, b: 20, l: 28 };


    const svg = d3.select(el).append('svg')
      .attr('width', w)
      .attr('height', h);


    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([m.l, w - m.r]);


    const y = d3.scaleLinear()
      .domain([0, 10])
      .range([h - m.b, m.t]);


    const xAxis = d3.axisBottom<Date>(x)
      .ticks(d3.timeWeek.every(1)) // solo un tick por semana
      .tickFormat(d3.timeFormat('%d %b') as any);


    const yAxis = d3.axisLeft<number>(y)
      .tickValues([0, 2, 4, 6, 8, 10])
      .tickFormat(d3.format('d'));


    svg.append('g')
      .attr('transform', `translate(0, ${h - m.b})`)
      .call(xAxis);


    svg.append('g')
      .attr('transform', `translate(${m.l}, 0)`)
      .call(yAxis);


    const line = d3.line<{ date: Date; value: number }>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);


    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3056d3')
      .attr('stroke-width', 2)
      .attr('d', line);


    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.value))
      .attr('r', 3)
      .attr('fill', '#1e3aa8');
  }


  // gráfico de donut para stock disponibilidad
  private renderStockDonut(element: HTMLElement, counts: Record<string, number>) {
    d3.select(element).selectAll('*').remove();


   const data: { estado: 'disponible' | 'agotado'; value: number }[] = [
      { estado: 'disponible', value: counts['disponible'] ?? 0 },
      { estado: 'agotado', value: counts['agotado'] ?? 0 },
    ];


    const width = 250;
    const height = 300;
    const radius = Math.min(width, height) / 2;


    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2 })`);


    const color = d3.scaleOrdinal<'disponible' | 'agotado', string>()
      .domain(['disponible', 'agotado'])
      .range(['#238bd1ff', '#F44336']);


    const pie = d3.pie<{ estado: 'disponible' | 'agotado'; value: number }>()
      .value(d => d.value);


    const arc = d3.arc<d3.PieArcDatum<{ estado: 'disponible' | 'agotado'; value: number }>>()
      .innerRadius(75)
      .outerRadius(radius);


    svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.estado))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);
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

