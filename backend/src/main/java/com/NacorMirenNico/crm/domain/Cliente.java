package com.NacorMirenNico.crm.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cliente")
@Getter @Setter @NoArgsConstructor
public class Cliente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank @Size(max = 120)
    private String nombre;

    @NotBlank @Email @Size(max = 254)
    private String email;

    @Size(max = 20)
    private String telefono;

    @Column(name = "fecha_registro", updatable = false, insertable = false)
    private LocalDateTime fechaRegistro; 
}
