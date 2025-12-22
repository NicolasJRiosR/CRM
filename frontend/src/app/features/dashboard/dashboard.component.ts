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

  bubbleData: {
    nombre: string;
    precio: number;
    vendidos: number;
    stock: number;
    proveedor: string;
  }[] = [];

  //Lista de metricas que se muestan en la tabla del dashboard
  metricOrder: { key: MetricKey; name: string }[] = [
    { key: 'clientesTotales', name: 'Clientes totales' },
    { key: 'clientesNuevosMes', name: 'Clientes nuevos este mes' },
    { key: 'clienteActivoMes', name: 'Clientes activos este mes' },
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
    { key: 'ProveedorMasCompras', name: 'Proveedor con mas compras' },
  ];

  //valores calculados de cada metrica
  metricValues: Partial<Record<MetricKey, any>> = {};

  //series de datos para los graficos
  clientesSerie: { date: Date; value: number }[] = [];
  clientesSerieCompleta: { date: string; value: number }[] = [];
  stockData: { nombre: string; stock: number }[] = [];
  interaccionesData: any[] = [];

  //cache de clientes y proveedores para búsquedas rápidas
  private clientesCache: Record<string, any> = {};
  private proveedoresCache: Record<string, { nombre: string }> = {};

  constructor(
    private http: HttpClient,
    private metricsSvc: MetricsService,
  ) {
    this.metricsSvc.registerRefresh(() => {
      //función de refresco de métricas
      console.log('[Dashboard] Recibido refresh desde MetricsService');
      this.loadMetrics();
    });
    this.loadMetrics();
  }

  //getter que devuelve la lista de metricas con sus valores
  get metrics() {
    return this.metricOrder.map((m) => ({
      name: m.name,
      value: this.metricValues[m.key] ?? '—',
    }));
  }

  //FUNCION PRINCIPAL PARA CARGAR TODAS LAS METRICAS DESDE LA API
  loadMetrics() {
    //-------BLOQUE CLIENTES---------
    this.http.get<any[]>('http://localhost:9080/api/clientes').subscribe({
      next: (clientes) => {
        //Métrica de clientes totales en nuestro sistema
        this.metricValues['clientesTotales'] = clientes.length;

        const hoy = new Date();
        hoy.setHours(12, 0, 0, 0);
        const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

        //Metrica de clientes nuevos este mes
        this.metricValues['clientesNuevosMes'] = clientes.filter((c) => {
          if (!c.fechaRegistro) return false;
          const d = new Date(c.fechaRegistro);
          d.setHours(12, 0, 0, 0);
          const mesRegistro = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return mesRegistro === mesActual;
        }).length;

        // Serie completa con TODOS los clientes (para filtrar por mes/año)
        this.clientesSerieCompleta = [
          ...clientes
            .filter(c => c.fechaRegistro)
            .map(c => {
              const iso = String(c.fechaRegistro);
              const soloFecha = iso.slice(0, 10);
              return {
                date: soloFecha,
                value: 1,
              };
            })
        ];
        console.log("📌 clientesSerieCompleta (primeros 20):", 
          this.clientesSerieCompleta.slice(0, 20)
        );
        console.log("📌 clientesSerieCompleta (últimos 20):", 
          this.clientesSerieCompleta.slice(-20)
        );
        console.log("📌 ¿Incluye 2025-12?:", 
          this.clientesSerieCompleta.some(d => d.date.startsWith("2025-12"))
        );


        //para el grafico de clientes nuevos por dia
        this.clientesSerie = this.buildNewClientsDailySeries(clientes);

        //cache de clientes, lo guardamos para poder identificar clientes en otras metricas
        this.clientesCache = clientes.reduce(
          (acc, c) => {
            acc[String(c.id ?? c.clienteId)] = c;
            return acc;
          },
          {} as Record<string, any>,
        );
      },
      error: (err) => console.error('Error clientes:', err),
    });

    //-------BLOQUE PRODUCTOS + VENTAS------------
    forkJoin({
      //hacemos dos peticiones, productos y ventas
      productos: this.http.get<any[]>('http://localhost:9080/api/productos'),
      ventas: this.http.get<any[]>('http://localhost:9080/api/ventas'),
    }).subscribe({
      next: ({ productos, ventas }) => {
        //cache de productos, que se guarda cada producto por su id para poder consultarlo luego
        const productosCache = productos.reduce(
          (acc, p) => {
            acc[String(p.id ?? p.productoId)] = p;
            return acc;
          },
          {} as Record<string, any>,
        );

        //para acumular estadisticas por cliente, las ventas que han hecho y el gasto que han tenido, se uso luego para calcular la metrica de clientes con ams ventas
        const statsPorCliente: Record<
          string,
          { ventas: number; gasto: number }
        > = {};

        ventas.forEach((v) => {
          const idCliente = String(v.clienteId ?? '');
          if (!idCliente) return;
          if (!statsPorCliente[idCliente]) {
            statsPorCliente[idCliente] = { ventas: 0, gasto: 0 };
          }
          statsPorCliente[idCliente].ventas += 1;
          statsPorCliente[idCliente].gasto += v.cantidad * v.precioUnitario;
        });

        //se ordenan los clientes segun el numero de ventas y gastos en caso de empate, se utiliza para la metrica de cliente con mas ventas también
        const ordenadosClientes = Object.entries(statsPorCliente).sort(
          (a, b) => {
            if (b[1].ventas !== a[1].ventas) {
              return b[1].ventas - a[1].ventas;
            }
            return b[1].gasto - a[1].gasto;
          },
        );

        //Metrica de cliente con mas ventas
        //Se guarda el cliente con mayor numero de ventas y si hay un empate se desempada con el gasto
        let clienteMasVentas: string;
        if (ordenadosClientes.length === 0) {
          clienteMasVentas = 'N/A';
        } else {
          const top = ordenadosClientes[0][1];
          const second = ordenadosClientes[1]?.[1];
          if (
            second &&
            top.ventas === second.ventas &&
            top.gasto === second.gasto
          ) {
            clienteMasVentas = 'No procede';
          } else {
            const topClienteId = ordenadosClientes[0][0];
            clienteMasVentas =
              this.clientesCache[topClienteId]?.nombre ?? topClienteId ?? 'N/A';
          }
        }

        this.metricValues['clienteMasVentas'] = clienteMasVentas;

        //metrica de el numero total de productos registrados en el catologo
        this.metricValues['productosCatalogo'] = productos.length;

        //Metrica de productos sin stock
        this.metricValues['sinstock'] = productos.filter(
          (p) => (p.stock ?? 0) === 0,
        ).length;

        //Metrica de Stock critico alerta, es decir productos en bajo stock (1 y 9 unidades)
        this.metricValues['stockCriticoAlerta'] = productos.filter((p) => {
          const s = p.stock ?? 0;
          return s >= 1 && s <= 9;
        }).length;

        //Datos para el grafico de stock disponible
        this.counts = { disponible: 0, agotado: 0 };
        productos.forEach((p) => {
          if (p.stock > 0) this.counts['disponible']++;
          else this.counts['agotado']++;
        });

        this.stockData = productos.map((p) => ({
          nombre: p.nombre,
          stock: p.stock ?? 0,
        }));

        //Metrica ventas totales registradas
        const ventasTotales = ventas.length;
        this.metricValues['ventasTotales'] = ventasTotales;

        //Metrica de la cantidad total de unidades que hemos vendido
        const productosVendidos = ventas.reduce(
          (sum, v) => sum + (v.cantidad ?? 1),
          0,
        );
        this.metricValues['productosVendidos'] = productosVendidos;

        //Metrica de ingresos totales
        const ingresosTotales = ventas.reduce(
          (sum, v) => sum + v.cantidad * v.precioUnitario,
          0,
        );
        this.metricValues['ingresosTotales'] = ingresosTotales;

        //Datos para el grafico de burbujas (productos mas vendidos, en el caso del grafico el top 10)
        const conteoPorProducto: Record<string, number> = {};
        ventas.forEach((v) => {
          const idProd = String(v.productoId ?? '');
          if (!idProd) return;
          const unidades = v.cantidad ?? 1;
          conteoPorProducto[idProd] =
            (conteoPorProducto[idProd] || 0) + unidades;
        });

        this.bubbleData = Object.entries(conteoPorProducto)
          .map(([id, vendidos]) => {
            const prod = productosCache[id];
            return {
              nombre: prod?.nombre ?? id,
              precio: prod?.precioUnitario ?? prod?.precio ?? 0,
              vendidos,
              stock: prod?.stock ?? 0,
              proveedor: prod?.proveedorNombre ?? prod?.proveedor ?? 'Desconocido', 
            };
          })
          .sort((a, b) => b.vendidos - a.vendidos)
          .slice(0, 10);

        this.bubbleData = [...this.bubbleData];

        //Metrica de producto mas vendido
        const ordenados = Object.entries(conteoPorProducto).sort(
          (a, b) => b[1] - a[1],
        );
        let productoMasVendido: string;

        if (ordenados.length === 0) {
          productoMasVendido = 'N/A';
        } else if (
          ordenados.length > 1 &&
          ordenados[0][1] === ordenados[1][1]
        ) {
          productoMasVendido = 'No procede';
        } else {
          const topId = ordenados[0][0];
          productoMasVendido = productosCache[topId]?.nombre ?? topId ?? 'N/A';
        }
        this.metricValues['productoMasVendido'] = productoMasVendido;

        //Metrica de clientes activos este mes, es decir clientes que hayan hecho alguna compra este mes
        const hoy = new Date();
        hoy.setHours(12, 0, 0, 0);
        const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

        const clientesActivos = new Set<string>();

        ventas.forEach((v) => {
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
      error: (err) => console.error('Error productos/ventas:', err),
    });

    //-----------BLOQUE INTERACCIONES----------
    this.http.get<any[]>('http://localhost:9080/api/interacciones').subscribe({
      next: (interacciones) => {
        //Metrica de interacciones totales
        const total = interacciones.length;

        //Conteo de tipos de interacciones
        const conteoTipos: Record<string, number> = {};
        interacciones.forEach((i) => {
          const tipo = String(i.tipo ?? 'desconocido');
          conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
        });

        //Ordenamos los tipos de interacciones por frecuencia
        const ordenados = Object.entries(conteoTipos).sort(
          (a, b) => b[1] - a[1],
        );
        const maxCount = ordenados[0]?.[1] ?? 0;

        //seleccionamos los tipos que empatan en el maximo
        const topTipos = ordenados
          .filter(([_, count]) => count === maxCount)
          .map(([tipo]) => tipo);

        //Metrica tipo de interaccion mas comun, si hay un empate se enseñan los dos
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
      },
      error: (err) => console.error('Error interacciones:', err),
    });

    //---------BLOQUE DE PROVEEDORES---------
    //Este bloque lo tenemos para guardar los nombres de los proveedores y luego no tener problemas para sacarlos en la metrica
    this.http.get<any[]>('http://localhost:9080/api/proveedores').subscribe({
      next: (proveedores) => {
        proveedores.forEach((p) => {
          const id = String(p.id ?? p.proveedorId ?? '');
          if (!id) return;
          this.proveedoresCache[id] = { nombre: p.nombre ?? 'Sin nombre' };
        });
      },
      error: (err) => console.error('Error proveedores:', err),
    });

    //---------BLOQUE DE COMPRAS---------
    this.http.get<any[]>('http://localhost:9080/api/compras').subscribe({
      next: (compras) => {
        // Conteo de compras por proveedor → cuántas veces se ha comprado a cada proveedor
        const conteoPorProveedor: Record<string, number> = {};
        compras.forEach((c) => {
          const idProv = String(c.proveedorId ?? c.idProveedor ?? '');
          if (!idProv) return;
          conteoPorProveedor[idProv] = (conteoPorProveedor[idProv] || 0) + 1;
        });

        // Ordenamos los proveedores por número de compras (descendente)
        const ordenados = Object.entries(conteoPorProveedor).sort(
          (a, b) => b[1] - a[1],
        );

        // Métrica: proveedor con más compras → si hay empate se pone "No procede"
        let proveedorMasCompras: string;
        if (ordenados.length === 0) {
          proveedorMasCompras = 'N/A';
        } else if (
          ordenados.length > 1 &&
          ordenados[0][1] === ordenados[1][1]
        ) {
          proveedorMasCompras = 'No procede'; // si hay empate
        } else {
          const topId = ordenados[0][0];
          // Aquí usamos el nombre del proveedor si está en el cache, si no mostramos el ID
          proveedorMasCompras =
            this.proveedoresCache[topId]?.nombre ?? topId ?? 'N/A';
        }

        this.metricValues['ProveedorMasCompras'] = proveedorMasCompras;
      },
      error: (err) => console.error('Error compras:', err),
    });
  }

  //FUNCIONES AUXILIARES PARA CONSTRUIR SERIES TEMPORALES DE CLIENTES

  /*Esta función cuenta cuántos clientes nuevos hay cada día en el último mes
    y devuelve una lista con la fecha y el numero de clientes de ese día*/
  private buildNewClientsDailySeries(
    clientes: any[],
  ): { date: Date; value: number }[] {
    const today = new Date();
    const start = new Date();
    start.setMonth(today.getMonth() - 1);

    const counts: Record<string, number> = {};
    clientes.forEach((c) => {
      if (!c.fechaRegistro) return;
      const key = this.toDay(c.fechaRegistro); //pasamos la fecha a formato YYYY-MM-DD con la funcion de toDay
      counts[key] = (counts[key] || 0) + 1; //sumamos 1 cliente en ese dia
    });

    //creamos la lista de dias desde ahce un mes hasta hoy, tambien pongo cuantos clientes hubo cada dia y 0 si no hubo ninguno
    return this.daysRange(start, today).map((d) => {
      const key = this.toDay(d);
      return { date: d, value: counts[key] || 0 };
    });
  }

  /*Esta función crea un array con todos los días entre dos fechas
    Ejemplo: si le das 1 de noviembre y 3 de noviembre, devuelve [1 nov, 2 nov, 3 nov]*/
  private daysRange(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    const d = new Date(start);
    d.setHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setHours(0, 0, 0, 0);

    while (d <= last) {
      days.push(new Date(d)); //añadimos dia
      d.setDate(d.getDate() + 1); //pasamos al siguiente dia
    }
    return days;
  }

  // Esta funcion convierte una fecha a texto con formato YYYY-MM-DD
  private toDay(date: Date | string): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); //quitamos horas y minutos
    return d.toISOString().slice(0, 10); //cogemos solo la parte de la fecha
  }
}
