package com.NacorMirenNico.crm.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteDTO {
    private Integer id;

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe tener un formato válido")
    private String email;

    @Size(max = 20, message = "El teléfono no puede superar 20 caracteres")
    private String telefono;

    private LocalDateTime fechaRegistro; 
}
