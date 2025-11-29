import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { MetricsService } from '../../shared/services/metrics.service';

// importa los hijos
import { StockDisponibleCharComponent } from './components/stock-disponible-char/stock-disponible-char.component';
import { GraficoBurbujasCharComponent } from './components/grafico-burbujas-char/grafico-burbujas-char.component';
import { MetricsTableComponent } from './components/metrics-table/metrics-table.component';
import { CrecimientoClientesCharComponent } from './components/crecimiento-clientes-char/crecimiento-clientes-char.component';

type MetricKey =
  | 'clientesTotales'
  | 'clientesNuevosMes'
  | 'productosCatalogo'
  | 'stockCriticoAlerta'
  | 'ventasTotales'
  | 'ingresosTotales'
  | 'productoMasVendido'
  | 'interaccionesTotales'
  | 'sinstock'
  | 'tipoInteraccionMasComun';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    MetricsTableComponent,
    CrecimientoClientesCharComponent,
    StockDisponibleCharComponent,
    GraficoBurbujasCharComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  counts = { disponible: 0, agotado: 0 };

  bubbleData: { nombre: string; precio: number; vendidos: number; stock: number }[] = [];

  metricOrder: { key: MetricKey; name: string }[] = [
    { key: 'clientesTotales', name: 'Clientes totales' },
    { key: 'clientesNuevosMes', name: 'Clientes nuevos este mes' },
    { key: 'productosCatalogo', name: 'Productos en catálogo' },
    { key: 'stockCriticoAlerta', name: 'Stock crítico alerta' },
    { key: 'sinstock', name: 'Sin stock' },
    { key: 'ventasTotales', name: 'Ventas totales' },
    { key: 'ingresosTotales', name: 'Ingresos totales' },
    { key: 'productoMasVendido', name: 'Producto más vendido' },
    { key: 'interaccionesTotales', name: 'Interacciones totales' },
    { key: 'tipoInteraccionMasComun', name: 'Tipo de interacción más común' },
  ];

  metricValues: Partial<Record<MetricKey, any>> = {};

  // Datos para hijos
  clientesSerie: { date: Date; value: number }[] = [];
  stockData: { nombre: string; stock: number }[] = [];
  interaccionesData: any[] = [];
  comprasSerie: { date: Date; value: number }[] = [];
  ventasSerie: { date: Date; value: number }[] = [];

  constructor(private http: HttpClient, private metricsSvc: MetricsService) {
    this.metricsSvc.registerRefresh(() => {
      console.log('[Dashboard] Recibido refresh desde MetricsService');
      this.loadMetrics();
    });
    this.loadMetrics();
  }

  get metrics() {
    return this.metricOrder.map(m => ({
      name: m.name,
      value: this.metricValues[m.key] ?? '—',
    }));
  }

  private loadMetrics() {
    // CLIENTES
    this.http.get<any[]>('http://localhost:9080/api/clientes').subscribe({
      next: clientes => {
        this.metricValues['clientesTotales'] = clientes.length;

        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        this.metricValues['clientesNuevosMes'] =
          clientes.filter(c => new Date(c.fechaRegistro) >= haceUnMes).length;

        this.clientesSerie = this.buildNewClientsDailySeries(clientes);
      },
      error: err => console.error('Error clientes:', err)
    });

    // PRODUCTOS + VENTAS juntos
    forkJoin({
      productos: this.http.get<any[]>('http://localhost:9080/api/productos'),
      ventas: this.http.get<any[]>('http://localhost:9080/api/ventas')
    }).subscribe({
      next: ({ productos, ventas }) => {
        const productosCache = productos.reduce((acc, p) => {
          acc[String(p.id ?? p.productoId)] = p;
          return acc;
        }, {} as Record<string, any>);

        // métricas de productos
        this.metricValues['productosCatalogo'] = productos.length;
        this.metricValues['stockCriticoAlerta'] = productos.filter(p => (p.stock ?? 0) < 10).length;
        this.metricValues['sinstock'] = productos.filter(p => (p.stock ?? 0) === 0).length;

        this.counts = { disponible: 0, agotado: 0 };
        productos.forEach(p => {
          if (p.stock > 0) this.counts['disponible']++;
          else this.counts['agotado']++;
        });

        this.stockData = productos.map(p => ({ nombre: p.nombre, stock: p.stock ?? 0 }));

        // métricas de ventas
        const ventasTotales = ventas.length;
        const ingresosTotales = ventas.reduce(
          (sum, v) => sum + (v.cantidad * v.precioUnitario),
          0
        );

        const conteoPorProducto: Record<string, number> = {};
        ventas.forEach(v => {
          const idProd = String(v.productoId ?? '');
          if (!idProd) return;
          conteoPorProducto[idProd] = (conteoPorProducto[idProd] || 0) + 1;
        });

        // bubbleData
        this.bubbleData = Object.entries(conteoPorProducto)
          .map(([id, vendidos]) => {
            const prod = productosCache[id];
            return {
              nombre: prod?.nombre ?? id,
              precio: prod?.precioUnitario ?? prod?.precio ?? 0,
              vendidos,
              stock: prod?.stock ?? 0
            };
          })
          .sort((a, b) => b.vendidos - a.vendidos)
          .slice(0, 10);
        this.bubbleData = [...this.bubbleData];

        // producto más vendido
        const topEntry = Object.entries(conteoPorProducto).sort((a, b) => b[1] - a[1])[0];
        const topId = topEntry?.[0];
        const topNombre =
          topId && productosCache[topId]?.nombre
            ? productosCache[topId].nombre
            : (topId ?? 'N/A');

        this.metricValues['ventasTotales'] = ventasTotales;
        this.metricValues['ingresosTotales'] = ingresosTotales;
        this.metricValues['productoMasVendido'] = topNombre;
      },
      error: err => console.error('Error productos/ventas:', err)
    });

    // INTERACCIONES
    this.http.get<any[]>('http://localhost:9080/api/interacciones').subscribe({
      next: interacciones => {
        const total = interacciones.length;

        const conteoTipos: Record<string, number> = {};
        interacciones.forEach(i => {
          const tipo = String(i.tipo ?? 'desconocido');
          conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
        });

        const ordenados = Object.entries(conteoTipos).sort((a, b) => b[1] - a[1]);
        const maxCount = ordenados[0]?.[1] ?? 0;
        const topTipos = ordenados.filter(([_, count]) => count === maxCount).map(([tipo]) => tipo);

        let tipoMasComun: string;
        if (total === 0) {
          tipoMasComun = '—';
        } else if (topTipos.length === 1) {
          tipoMasComun = topTipos[0];
        } else if (topTipos.length === 2) {
          tipoMasComun = `${topTipos[0]}/${topTipos[1]}`;
        } else {
          tipoMasComun = 'Sin predominio';
        }

        this.metricValues['interaccionesTotales'] = total;
        this.metricValues['tipoInteraccionMasComun'] = tipoMasComun;
        this.interaccionesData = interacciones;
      },
      error: err => console.error('Error interacciones:', err)
    });

    // COMPRAS + comparativa ventas
    this.http.get<any[]>('http://localhost:9080/api/compras').subscribe({
      next: compras => {
        this.comprasSerie = compras.map(c => ({
          date: new Date(c.fecha ?? c.fechaCompra ?? Date.now()),
          value: c.total ?? c.monto ?? 1
        }));

        this.http.get<any[]>('http://localhost:9080/api/ventas').subscribe({
          next: ventas => {
            this.ventasSerie = ventas.map(v => ({
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

  // Helpers
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
}
