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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.NacorMirenNico.crm.domain.Interaccion;
import com.NacorMirenNico.crm.dto.InteraccionDTO;
import com.NacorMirenNico.crm.repo.InteraccionRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/interacciones")
public class InteraccionController {
    private final InteraccionRepository repo;
    public InteraccionController(InteraccionRepository repo) { this.repo = repo; }

    @GetMapping
    public List<InteraccionDTO> list() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    public InteraccionDTO get(@PathVariable Integer id) {
        Interaccion i = repo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Interacción " + id + " no encontrada"));
        return toDTO(i);
    }

    @PostMapping
    public ResponseEntity<InteraccionDTO> create(@RequestBody @Valid InteraccionDTO dto) {
        Interaccion saved = repo.save(toEntity(dto));
        return ResponseEntity.created(URI.create("/api/interacciones/" + saved.getId())).body(toDTO(saved));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) { repo.deleteById(id); }

    private InteraccionDTO toDTO(Interaccion i) {
        return new InteraccionDTO(i.getId(), i.getCliente().getId(), i.getTipo(), i.getDescripcion(), i.getFechaHora());
    }

    private Interaccion toEntity(InteraccionDTO dto) {
        Interaccion i = new Interaccion();
        i.setId(dto.getId());
        i.setTipo(dto.getTipo());
        i.setDescripcion(dto.getDescripcion());
        i.setFechaHora(dto.getFechaHora());
        return i;
    }
}
