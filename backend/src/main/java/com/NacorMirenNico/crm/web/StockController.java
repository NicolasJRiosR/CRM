package com.NacorMirenNico.crm.web;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.NacorMirenNico.crm.domain.Cliente;
import com.NacorMirenNico.crm.domain.Compra;
import com.NacorMirenNico.crm.domain.Producto;
import com.NacorMirenNico.crm.domain.Proveedor;
import com.NacorMirenNico.crm.domain.Venta;
import com.NacorMirenNico.crm.dto.CompraDTO;
import com.NacorMirenNico.crm.dto.MovimientoStockRequest;
import com.NacorMirenNico.crm.dto.VentaDTO;
import com.NacorMirenNico.crm.repo.ClienteRepository;
import com.NacorMirenNico.crm.repo.CompraRepository;
import com.NacorMirenNico.crm.repo.ProductoRepository;
import com.NacorMirenNico.crm.repo.ProveedorRepository;
import com.NacorMirenNico.crm.repo.VentaRepository;

import jakarta.validation.Valid;

@RestController
public class StockController {
    private final ProductoRepository productos;
    private final ProveedorRepository proveedores;
    private final ClienteRepository clientes;
    private final CompraRepository compras;
    private final VentaRepository ventas;

    public StockController(ProductoRepository productos, ProveedorRepository proveedores,
                           ClienteRepository clientes, CompraRepository compras, VentaRepository ventas) {
        this.productos = productos;
        this.proveedores = proveedores;
        this.clientes = clientes;
        this.compras = compras;
        this.ventas = ventas;
    }

    //  GET /api/compras
    @GetMapping("/api/compras")
    public List<CompraDTO> listarCompras() {
        return compras.findAll().stream().map(this::toDTO).toList();
    }

    // GET /api/ventas
    @GetMapping("/api/ventas")
    public List<VentaDTO> listarVentas() {
        return ventas.findAll().stream().map(this::toDTO).toList();
    }

    // POST /api/compras
    @PostMapping("/api/compras")
    public ResponseEntity<CompraDTO> crearCompra(@RequestBody @Valid MovimientoStockRequest rq) {
        Producto p = productos.findById(rq.productoId())
            .orElseThrow(() -> new NoSuchElementException("Producto " + rq.productoId() + " no existe"));
        Proveedor prov = proveedores.findById(rq.entidadId())
            .orElseThrow(() -> new NoSuchElementException("Proveedor " + rq.entidadId() + " no existe"));

        p.setStock(p.getStock() + rq.cantidad());
        productos.save(p);

        Compra compra = new Compra();
        compra.setProducto(p);
        compra.setProveedor(prov);
        compra.setCantidad(rq.cantidad());
        compra.setFecha(LocalDate.now());
        compra.setPrecioUnitario(rq.precioUnitario());

        Compra saved = compras.save(compra);

        return ResponseEntity.created(URI.create("/api/compras/" + saved.getId())).body(toDTO(saved));
    }

    // POST /api/ventas
    @PostMapping("/api/ventas")
    public ResponseEntity<VentaDTO> crearVenta(@RequestBody @Valid MovimientoStockRequest rq) {
        Producto p = productos.findById(rq.productoId())
            .orElseThrow(() -> new NoSuchElementException("Producto " + rq.productoId() + " no existe"));

        if (p.getStock() < rq.cantidad()) {
            throw new IllegalArgumentException("Stock insuficiente: " + p.getStock() + " < " + rq.cantidad());
        }

        Cliente cli = clientes.findById(rq.entidadId())
            .orElseThrow(() -> new NoSuchElementException("Cliente " + rq.entidadId() + " no existe"));

        p.setStock(p.getStock() - rq.cantidad());
        productos.save(p);

        Venta venta = new Venta();
        venta.setProducto(p);
        venta.setCliente(cli);
        venta.setCantidad(rq.cantidad());
        venta.setFecha(LocalDate.now());
        venta.setPrecioUnitario(rq.precioUnitario());

        Venta saved = ventas.save(venta);

        return ResponseEntity.created(URI.create("/api/ventas/" + saved.getId())).body(toDTO(saved));
    }
    @PutMapping("/api/ventas/{id}")
    public ResponseEntity<VentaDTO> actualizarVenta(
        @PathVariable Integer id,
        @RequestBody @Valid MovimientoStockRequest rq) {

    Venta venta = ventas.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Venta " + id + " no existe"));

    Producto p = productos.findById(rq.productoId())
        .orElseThrow(() -> new NoSuchElementException("Producto " + rq.productoId() + " no existe"));
    Cliente cli = clientes.findById(rq.entidadId())
        .orElseThrow(() -> new NoSuchElementException("Cliente " + rq.entidadId() + " no existe"));

    // Ajuste de stock: diferencia entre nueva cantidad y la anterior
    int diferencia = rq.cantidad() - venta.getCantidad();
    int nuevoStock = p.getStock() - diferencia;

    if (nuevoStock < 0) {
        throw new IllegalArgumentException("Stock insuficiente: " + p.getStock() + " < diferencia " + diferencia);
    }

    p.setStock(nuevoStock);
    productos.save(p);

    venta.setProducto(p);
    venta.setCliente(cli);
    venta.setCantidad(rq.cantidad());
    venta.setPrecioUnitario(rq.precioUnitario());
    venta.setFecha(LocalDate.now());

    Venta saved = ventas.save(venta);
    return ResponseEntity.ok(toDTO(saved));
}
   @PutMapping("/api/compras/{id}")
    public ResponseEntity<CompraDTO> actualizarCompra(
        @PathVariable Integer id,
        @RequestBody @Valid MovimientoStockRequest rq) {

    // Buscar la compra original
    Compra compra = compras.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Compra " + id + " no existe"));

    // Buscar producto y proveedor
    Producto p = productos.findById(rq.productoId())
        .orElseThrow(() -> new NoSuchElementException("Producto " + rq.productoId() + " no existe"));
    Proveedor prov = proveedores.findById(rq.entidadId())
        .orElseThrow(() -> new NoSuchElementException("Proveedor " + rq.entidadId() + " no existe"));

    // Ajuste de stock: diferencia entre nueva cantidad y la anterior
    int diferencia = rq.cantidad() - compra.getCantidad();
    p.setStock(p.getStock() + diferencia);
    productos.save(p);

    // Actualizar la compra
    compra.setProducto(p);
    compra.setProveedor(prov);
    compra.setCantidad(rq.cantidad());
    compra.setPrecioUnitario(rq.precioUnitario());
    compra.setFecha(LocalDate.now());

    Compra saved = compras.save(compra);
    return ResponseEntity.ok(toDTO(saved));
}



    // Conversión a DTO
    private CompraDTO toDTO(Compra c) {
        return new CompraDTO(
            c.getId(),
            c.getProveedor().getId(),
            c.getProducto().getId(),
            c.getFecha(),
            c.getCantidad(),
            c.getPrecioUnitario()
        );
    }

    private VentaDTO toDTO(Venta v) {
        return new VentaDTO(
            v.getId(),
            v.getCliente().getId(),
            v.getProducto().getId(),
            v.getFecha(),
            v.getCantidad(),
            v.getPrecioUnitario()
        );
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }
}
