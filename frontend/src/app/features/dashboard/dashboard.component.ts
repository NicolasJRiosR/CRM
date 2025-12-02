import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { MetricsService } from '../../shared/services/metrics.service';

//importo los componentes graficos que forman parte del dashboard
import { StockDisponibleCharComponent } from './components/stock-disponible-char/stock-disponible-char.component';
import { GraficoBurbujasCharComponent } from './components/grafico-burbujas-char/grafico-burbujas-char.component';
import { MetricsTableComponent } from './components/metrics-table/metrics-table.component';
import { CrecimientoClientesCharComponent } from './components/crecimiento-clientes-char/crecimiento-clientes-char.component';

//definicion de las claves de metricas que se van a usar en el dashboard
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
  | 'productosVendidos'
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

  //Lista de metricas que se muestan en la tabla del dashboard
  metricOrder: { key: MetricKey; name: string }[] = [
    { key: 'clientesTotales', name: 'Clientes totales' },
    { key: 'clientesNuevosMes', name: 'Clientes nuevos este mes' },
    { key: 'clienteActivoMes', name: 'Clientes activos este mes'},
    { key: 'clienteMasVentas', name: 'Cliente con más ventas' },
    { key: 'productosCatalogo', name: 'Productos en catálogo' },
    { key: 'stockCriticoAlerta', name: 'Stock crítico alerta' },
    { key: 'sinstock', name: 'Sin stock' },
    { key: 'ventasTotales', name: 'Ventas totales' },
    { key: 'productosVendidos', name: 'Productos Vendidos' },
    { key: 'productoMasVendido', name: 'Producto más vendido' },
    { key: 'ingresosTotales', name: 'Ingresos totales' },
    { key: 'interaccionesTotales', name: 'Interacciones totales' },
    { key: 'tipoInteraccionMasComun', name: 'Tipo de interacción más común' },
    { key: 'ProveedorMasCompras', name: 'Proveedor con mas compras'},
  ];

  //valores calculados de cada metrica
  metricValues: Partial<Record<MetricKey, any>> = {};

  //series de datos para los graficos
  clientesSerie: { date: Date; value: number }[] = [];
  stockData: { nombre: string; stock: number }[] = [];
  interaccionesData: any[] = [];
  comprasSerie: { date: Date; value: number }[] = [];
  ventasSerie: { date: Date; value: number }[] = [];

  //cache de clientes para búsquedas rápidas
  private clientesCache: Record<string, any> = {};

  constructor(private http: HttpClient, private metricsSvc: MetricsService) {
    this.metricsSvc.registerRefresh(() => {   //función de refresco de métricas
      console.log('[Dashboard] Recibido refresh desde MetricsService');
      this.loadMetrics();
    });
    this.loadMetrics();
  }

  //getter que devuelve la lista de metricas con sus valores 
  get metrics() {
    return this.metricOrder.map(m => ({
      name: m.name,
      value: this.metricValues[m.key] ?? '—',
    }));
  }

  //FUNCION PRINCIPAL PARA CARGAR TODAS LAS METRICAS DESDE LA API
  private loadMetrics() {
    
    //-------BLOQUE CLIENTES---------
    this.http.get<any[]>('http://localhost:9080/api/clientes').subscribe({
      next: clientes => {
        this.metricValues['clientesTotales'] = clientes.length;

        const hoy = new Date();
        hoy.setHours(12, 0, 0, 0);
        const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

        this.metricValues['clientesNuevosMes'] = clientes.filter(c => {
          if (!c.fechaRegistro) return false;
          const d = new Date(c.fechaRegistro);
          d.setHours(12, 0, 0, 0);
          const mesRegistro = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return mesRegistro === mesActual;
        }).length;

        this.clientesSerie = this.buildNewClientsDailySeries(clientes);

        
        this.clientesCache = clientes.reduce((acc, c) => {
          acc[String(c.id ?? c.clienteId)] = c;
          return acc;
        }, {} as Record<string, any>);
      },
      error: err => console.error('Error clientes:', err)
    });

    //-------BLOQUE PRODUCTOS + VENTAS------------
    forkJoin({
      productos: this.http.get<any[]>('http://localhost:9080/api/productos'),
      ventas: this.http.get<any[]>('http://localhost:9080/api/ventas')
    }).subscribe({
      next: ({ productos, ventas }) => {
        const productosCache = productos.reduce((acc, p) => {
          acc[String(p.id ?? p.productoId)] = p;
          return acc;
        }, {} as Record<string, any>);
        
      
        
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

        
        this.metricValues['productosCatalogo'] = productos.length;
        // Sin stock
        this.metricValues['sinstock'] = productos.filter(p => (p.stock ?? 0) === 0).length;

        // Stock crítico
        this.metricValues['stockCriticoAlerta'] = productos.filter(p => {
          const s = p.stock ?? 0;
          return s >= 1 && s <= 9;
        }).length;


        this.counts = { disponible: 0, agotado: 0 };
        productos.forEach(p => {
          if (p.stock > 0) this.counts['disponible']++;
          else this.counts['agotado']++;
        });

        this.stockData = productos.map(p => ({ nombre: p.nombre, stock: p.stock ?? 0 }));

        
        const ventasTotales = ventas.length;

        const productosVendidos = ventas.reduce(
          (sum, v) => sum + (v.cantidad ?? 1),
          0
        );

        const ingresosTotales = ventas.reduce(
          (sum, v) => sum + (v.cantidad * v.precioUnitario),
          0
        );

        this.metricValues['ventasTotales'] = ventasTotales;
        this.metricValues['productosVendidos'] = productosVendidos; 
        this.metricValues['ingresosTotales'] = ingresosTotales;


        this.metricValues['ventasTotales'] = ventasTotales;
        this.metricValues['productosVendidos'] = productosVendidos;
        this.metricValues['ingresosTotales'] = ingresosTotales;

        const conteoPorProducto: Record<string, number> = {};
        ventas.forEach(v => {
          const idProd = String(v.productoId ?? '');
          if (!idProd) return;
          const unidades = v.cantidad ?? 1; 
          conteoPorProducto[idProd] = (conteoPorProducto[idProd] || 0) + unidades;
        });

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


      
      const hoy = new Date();
      hoy.setHours(12, 0, 0, 0);
      const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

      const clientesActivos = new Set<string>();

      ventas.forEach(v => {
        const fRaw = v.fecha ?? v.fechaVenta;
        if (!fRaw) return;

        const f = new Date(fRaw);
        f.setHours(12, 0, 0, 0); 
        const mesVenta = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;

        const id = v.clienteId;
        if (id === null || id === undefined) return;

        const idKey = String(id); 

        if (mesVenta === mesActual) {
          clientesActivos.add(idKey);
        }
      });

      this.metricValues['clienteActivoMes'] = clientesActivos.size;

      },
          error: err => console.error('Error productos/ventas:', err)
          
        });

    //-----------BLOQUE INTERACCIONES----------
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

    //---------BLOQUE DE COMPRAS---------
    this.http.get<any[]>('http://localhost:9080/api/compras').subscribe({
      next: compras => {
        this.comprasSerie = compras.map(c => ({
          date: new Date(c.fecha ?? c.fechaCompra ?? Date.now()),
          value: c.total ?? c.monto ?? 1
        }));
        
        
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
        
      //---------BLOQUE DE VENTAS-------
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

  //FUNCIONES AUXILIARES PARA CONSTRUIR SERIES TEMPORALES DE CLIENTES
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
