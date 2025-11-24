package com.NacorMirenNico.crm.web;

import java.net.URI;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.NacorMirenNico.crm.domain.Producto;
import com.NacorMirenNico.crm.dto.ProductoDTO;
import com.NacorMirenNico.crm.repo.ProductoRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoRepository repo;
    public ProductoController(ProductoRepository repo) { this.repo = repo; }

    @GetMapping
    public List<ProductoDTO> list() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    public ProductoDTO get(@PathVariable Integer id) {
        Producto p = repo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Producto " + id + " no encontrado"));
        return toDTO(p);
    }

    @PostMapping
    public ResponseEntity<ProductoDTO> create(@RequestBody @Valid ProductoDTO dto) {
        Producto saved = repo.save(toEntity(dto));
        return ResponseEntity.created(URI.create("/api/productos/" + saved.getId())).body(toDTO(saved));
    }

    @PutMapping("/{id}")
    public ProductoDTO update(@PathVariable Integer id, @RequestBody @Valid ProductoDTO dto) {
        Producto cur = repo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Producto " + id + " no encontrado"));
        cur.setNombre(dto.getNombre());
        cur.setStock(dto.getStock());
        cur.setPrecio(dto.getPrecio());
        Producto updated = repo.save(cur);
        return toDTO(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }

    private ProductoDTO toDTO(Producto p) {
        return new ProductoDTO(p.getId(), p.getNombre(), p.getStock(), p.getPrecio());
    }

    private Producto toEntity(ProductoDTO dto) {
        Producto p = new Producto();
        p.setId(dto.getId());
        p.setNombre(dto.getNombre());
        p.setStock(dto.getStock());
        p.setPrecio(dto.getPrecio());
        return p;
    }
}
