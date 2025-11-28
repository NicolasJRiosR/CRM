package com.NacorMirenNico.crm.web;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.NacorMirenNico.crm.domain.Producto;
import com.NacorMirenNico.crm.dto.ProductoDTO;
import com.NacorMirenNico.crm.repo.ProductoRepository;
import com.NacorMirenNico.crm.repo.ProveedorRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoRepository productos;
    private final ProveedorRepository proveedores;

    public ProductoController(ProductoRepository productos, ProveedorRepository proveedores) {
        this.productos = productos;
        this.proveedores = proveedores;
    }

    @GetMapping
    public List<ProductoDTO> list() {
        return productos.findAll().stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    public ProductoDTO get(@PathVariable Integer id) {
        Producto p = productos.findById(id).orElseThrow();
        return toDTO(p);
    }

    @PostMapping
    public ResponseEntity<ProductoDTO> create(@RequestBody @Valid ProductoDTO dto) {
        Producto saved = productos.save(toEntity(dto));
        return ResponseEntity.created(URI.create("/api/productos/" + saved.getId())).body(toDTO(saved));
    }

    @PutMapping("/{id}")
    public ProductoDTO update(@PathVariable Integer id, @RequestBody @Valid ProductoDTO dto) {
        Producto cur = productos.findById(id).orElseThrow();
        cur.setNombre(dto.getNombre());
        cur.setStock(dto.getStock());
        cur.setPrecio(dto.getPrecio());
        cur.setProveedor(proveedores.findById(dto.getProveedorId()).orElseThrow());
        return toDTO(productos.save(cur));
    }

    private ProductoDTO toDTO(Producto p) {
    return new ProductoDTO(
        p.getId(),
        p.getNombre(),
        p.getStock(),
        p.getPrecio(),
        p.getProveedor().getId(),
        p.getProveedor().getNombre()
    );
}


    private Producto toEntity(ProductoDTO dto) {
        Producto p = new Producto();
        p.setId(dto.getId());
        p.setNombre(dto.getNombre());
        p.setStock(dto.getStock());
        p.setPrecio(dto.getPrecio());
        p.setProveedor(proveedores.findById(dto.getProveedorId()).orElseThrow());
        return p;
    }
}
