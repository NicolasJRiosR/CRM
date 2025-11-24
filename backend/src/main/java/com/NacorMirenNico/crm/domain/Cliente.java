package com.NacorMirenNico.crm.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

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
}
