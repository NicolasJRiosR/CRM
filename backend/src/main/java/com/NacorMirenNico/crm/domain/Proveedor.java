package com.NacorMirenNico.crm.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "proveedor")
@Getter @Setter @NoArgsConstructor
public class Proveedor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank @Size(max = 120)
    private String nombre;
}
