package com.NacorMirenNico.crm.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

   
    private LocalDateTime fechaHora;
}
