package com.NacorMirenNico.crm.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "proveedor")
@Getter @Setter @NoArgsConstructor
public class Proveedor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank @Size(max = 120)
    private String nombre;

    @Size(max = 100)
    private String contacto;

    @Size(max = 20)
    private String telefono;
}
