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
  | 'clienteActivoMes'
  | 'clienteMasVentas'
  | 'productosCatalogo'
  | 'stockCriticoAlerta'
  | 'ventasTotales'
  | 'ingresosTotales'
  | 'productoMasVendido'
  | 'interaccionesTotales'
  | 'sinstock'
  | 'tipoInteraccionMasComun'
  | 'ProveedorMasCompras';


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
    { key: 'clienteActivoMes', name: 'Clientes activos este mes'},
    { key: 'clienteMasVentas', name: 'Cliente con más ventas' },
    { key: 'productosCatalogo', name: 'Productos en catálogo' },
    { key: 'stockCriticoAlerta', name: 'Stock crítico alerta' },
    { key: 'sinstock', name: 'Sin stock' },
    { key: 'ventasTotales', name: 'Ventas totales' },
    { key: 'ingresosTotales', name: 'Ingresos totales' },
    { key: 'productoMasVendido', name: 'Producto más vendido' },
    { key: 'interaccionesTotales', name: 'Interacciones totales' },
    { key: 'tipoInteraccionMasComun', name: 'Tipo de interacción más común' },
    { key: 'ProveedorMasCompras', name: 'Proveedor con mas compras'},
  ];
  metricValues: Partial<Record<MetricKey, any>> = {};

  // Datos para hijos
  clientesSerie: { date: Date; value: number }[] = [];
  stockData: { nombre: string; stock: number }[] = [];
  interaccionesData: any[] = [];
  comprasSerie: { date: Date; value: number }[] = [];
  ventasSerie: { date: Date; value: number }[] = [];

  // Cache de clientes para poder mostrar nombres
  private clientesCache: Record<string, any> = {};

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

        // cache de clientes
        this.clientesCache = clientes.reduce((acc, c) => {
          acc[String(c.id ?? c.clienteId)] = c;
          return acc;
        }, {} as Record<string, any>);
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
        
        // cliente con más ventas, desempate:
     /* Si ventas y gasto son exactamente iguales → devuelves "No procede".
        Si tienen el mismo número de ventas pero distinto gasto → gana el que más gastó.
        Si tienen distinto número de ventas → gana el que más ventas tiene. */
        
        const statsPorCliente: Record<string, { ventas: number; gasto: number }> = {};

        ventas.forEach(v => {
          const idCliente = String(v.clienteId ?? '');
          if (!idCliente) return;
          if (!statsPorCliente[idCliente]) {
            statsPorCliente[idCliente] = { ventas: 0, gasto: 0 };
          }
          statsPorCliente[idCliente].ventas += 1;
          statsPorCliente[idCliente].gasto += (v.cantidad * v.precioUnitario);
        });

        const ordenadosClientes = Object.entries(statsPorCliente).sort((a, b) => {
          if (b[1].ventas !== a[1].ventas) {
            return b[1].ventas - a[1].ventas;
          }
          return b[1].gasto - a[1].gasto;
        });

        let clienteMasVentas: string;
        if (ordenadosClientes.length === 0) {
          clienteMasVentas = 'N/A';
        } else {
          const top = ordenadosClientes[0][1];
          const second = ordenadosClientes[1]?.[1];
          if (second && top.ventas === second.ventas && top.gasto === second.gasto) {
            clienteMasVentas = 'No procede';
          } else {
            const topClienteId = ordenadosClientes[0][0];
            clienteMasVentas = this.clientesCache[topClienteId]?.nombre ?? topClienteId ?? 'N/A';
          }
        }

        this.metricValues['clienteMasVentas'] = clienteMasVentas;

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

        /// producto más vendido con control de empate
        const ordenados = Object.entries(conteoPorProducto).sort((a, b) => b[1] - a[1]);

        let productoMasVendido: string;

        if (ordenados.length === 0) {
          productoMasVendido = 'N/A';
        } else if (ordenados.length > 1 && ordenados[0][1] === ordenados[1][1]) {
          productoMasVendido = 'No procede';
        } else {
          const topId = ordenados[0][0];
          productoMasVendido =
            productosCache[topId]?.nombre ?? topId ?? 'N/A';
        }

        this.metricValues['ventasTotales'] = ventasTotales;
        this.metricValues['ingresosTotales'] = ingresosTotales;
        this.metricValues['productoMasVendido'] = productoMasVendido;


        // clientes activos este mes
        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const añoActual = ahora.getFullYear();

        const clientesActivos = new Set(
          ventas
            .filter(v => {
              const fecha = new Date(v.fecha ?? v.fechaVenta ?? Date.now());
              return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
            })
            .map(v => v.clienteId)
        );

        this.metricValues['clienteActivoMes'] = clientesActivos.size;

        
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
        
        // 👇 proveedor con más compras
        const conteoPorProveedor: Record<string, number> = {};
        compras.forEach(c => {
          const idProv = String(c.proveedorId ?? c.idProveedor ?? '');
          if (!idProv) return;
          conteoPorProveedor[idProv] = (conteoPorProveedor[idProv] || 0) + 1;
        });

        const ordenados = Object.entries(conteoPorProveedor).sort((a, b) => b[1] - a[1]);

        let proveedorMasCompras: string;
        if (ordenados.length === 0) {
          proveedorMasCompras = 'N/A';
        } else if (ordenados.length > 1 && ordenados[0][1] === ordenados[1][1]) {
          proveedorMasCompras = 'No procede'; //si hay empate
        } else {
          const topId = ordenados[0][0];
          proveedorMasCompras = topId;
        }

        this.metricValues['ProveedorMasCompras'] = proveedorMasCompras;
        
        //comparativa ventas
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
