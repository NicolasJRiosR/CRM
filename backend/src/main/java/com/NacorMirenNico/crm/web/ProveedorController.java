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

import com.NacorMirenNico.crm.domain.Proveedor;
import com.NacorMirenNico.crm.dto.ProveedorDTO;
import com.NacorMirenNico.crm.repo.ProveedorRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {
    private final ProveedorRepository repo;
    public ProveedorController(ProveedorRepository repo) { this.repo = repo; }

    @GetMapping
    public List<ProveedorDTO> list() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    public ProveedorDTO get(@PathVariable Integer id) {
        Proveedor p = repo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Proveedor " + id + " no encontrado"));
        return toDTO(p);
    }

    @PostMapping
    public ResponseEntity<ProveedorDTO> create(@RequestBody @Valid ProveedorDTO dto) {
        Proveedor saved = repo.save(toEntity(dto));
        return ResponseEntity.created(URI.create("/api/proveedores/" + saved.getId())).body(toDTO(saved));
    }

    @PutMapping("/{id}")
    public ProveedorDTO update(@PathVariable Integer id, @RequestBody @Valid ProveedorDTO dto) {
        Proveedor cur = repo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Proveedor " + id + " no encontrado"));
        cur.setNombre(dto.getNombre());
        cur.setContacto(dto.getContacto());
        cur.setTelefono(dto.getTelefono());
        return toDTO(repo.save(cur));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }

    private ProveedorDTO toDTO(Proveedor p) {
        return new ProveedorDTO(p.getId(), p.getNombre(), p.getContacto(), p.getTelefono());
    }

    private Proveedor toEntity(ProveedorDTO dto) {
        Proveedor p = new Proveedor();
        p.setId(dto.getId());
        p.setNombre(dto.getNombre());
        p.setContacto(dto.getContacto());
        p.setTelefono(dto.getTelefono());
        return p;
    }
}

