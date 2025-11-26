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

import com.NacorMirenNico.crm.domain.Cliente;
import com.NacorMirenNico.crm.dto.ClienteDTO;
import com.NacorMirenNico.crm.repo.ClienteRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final ClienteRepository repo;

    public ClienteController(ClienteRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<ClienteDTO> list() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    public ClienteDTO get(@PathVariable Integer id) {
        Cliente cliente = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Cliente " + id + " no encontrado"));
        return toDTO(cliente);
    }

    @PostMapping
    public ResponseEntity<ClienteDTO> create(@RequestBody @Valid ClienteDTO dto) {
        Cliente saved = repo.save(toEntity(dto));
        return ResponseEntity.created(URI.create("/api/clientes/" + saved.getId())).body(toDTO(saved));
    }

    @PutMapping("/{id}")
    public ClienteDTO update(@PathVariable Integer id, @RequestBody @Valid ClienteDTO dto) {
        Cliente cur = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Cliente " + id + " no encontrado"));
        cur.setNombre(dto.getNombre());
        cur.setEmail(dto.getEmail());
        cur.setTelefono(dto.getTelefono());
        cur.setFechaRegistro(dto.getFechaRegistro());
        Cliente updated = repo.save(cur);
        return toDTO(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }

    private ClienteDTO toDTO(Cliente c) {
        return new ClienteDTO(
            c.getId(),
            c.getNombre(),
            c.getEmail(),
            c.getTelefono(),
            c.getFechaRegistro()
        );
    }

    private Cliente toEntity(ClienteDTO dto) {
        Cliente c = new Cliente();
        c.setId(dto.getId());
        c.setNombre(dto.getNombre());
        c.setEmail(dto.getEmail());
        c.setTelefono(dto.getTelefono());
        c.setFechaRegistro(dto.getFechaRegistro());
        return c;
    }
}
