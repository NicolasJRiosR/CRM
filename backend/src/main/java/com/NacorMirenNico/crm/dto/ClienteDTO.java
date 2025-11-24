package com.NacorMirenNico.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor  // Lombok genera getters, setters, toString, equals y hashCode automáticamente
public class ClienteDTO {

    private Integer id;

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe tener un formato válido")
    private String email;
}
