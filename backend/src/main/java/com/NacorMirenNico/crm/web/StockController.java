package com.NacorMirenNico.crm.web;

import java.net.URI;
import java.time.LocalDate;
import java.util.NoSuchElementException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
@RequestMapping("/api/stock")
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

    @PostMapping("/compras")
    public ResponseEntity<CompraDTO> crearCompra(@RequestBody @Valid MovimientoStockRequest rq) {
        Producto p = productos.findById(rq.productoId())
            .orElseThrow(() -> new NoSuchElementException("Producto " + rq.productoId() + " no existe"));
        Proveedor prov = proveedores.findById(rq.entidadId())
            .orElseThrow(() -> new NoSuchElementException("Proveedor " + rq.entidadId() + " no existe"));

        // Actualizar stock
        p.setStock(p.getStock() + rq.cantidad());
        productos.save(p);

        // Registrar compra con precioUnitario
        Compra compra = new Compra();
        compra.setProducto(p);
        compra.setProveedor(prov);
        compra.setCantidad(rq.cantidad());
        compra.setFecha(LocalDate.now());
        compra.setPrecioUnitario(rq.precioUnitario()); 

        Compra saved = compras.save(compra);

        return ResponseEntity.created(URI.create("/api/stock/compras/" + saved.getId())).body(toDTO(saved));
    }

    @PostMapping("/ventas")
    public ResponseEntity<VentaDTO> crearVenta(@RequestBody @Valid MovimientoStockRequest rq) {
        Producto p = productos.findById(rq.productoId())
            .orElseThrow(() -> new NoSuchElementException("Producto " + rq.productoId() + " no existe"));

        if (p.getStock() < rq.cantidad()) {
            throw new IllegalArgumentException("Stock insuficiente: " + p.getStock() + " < " + rq.cantidad());
        }

        Cliente cli = clientes.findById(rq.entidadId())
            .orElseThrow(() -> new NoSuchElementException("Cliente " + rq.entidadId() + " no existe"));

        // Actualizar stock
        p.setStock(p.getStock() - rq.cantidad());
        productos.save(p);

        // Registrar venta con precioUnitario
        Venta venta = new Venta();
        venta.setProducto(p);
        venta.setCliente(cli);
        venta.setCantidad(rq.cantidad());
        venta.setFecha(LocalDate.now());
        venta.setPrecioUnitario(rq.precioUnitario());

        Venta saved = ventas.save(venta);

        return ResponseEntity.created(URI.create("/api/stock/ventas/" + saved.getId())).body(toDTO(saved));
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
}
