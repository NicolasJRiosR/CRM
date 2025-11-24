package com.NacorMirenNico.crm.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interaccion")
@Getter @Setter @NoArgsConstructor
public class Interaccion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false) @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotBlank @Size(max = 30)
    private String tipo;

    @NotBlank @Size(max = 500)
    private String descripcion;

    @PastOrPresent
    private LocalDateTime fechaHora;
}
