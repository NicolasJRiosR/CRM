package com.NacorMirenNico.crm.dto;

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
public class ProveedorDTO {
    private Integer id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
    private String nombre;

    @Size(max = 100, message = "El contacto no puede superar 100 caracteres")
    private String contacto;

    @Size(max = 20, message = "El teléfono no puede superar 20 caracteres")
    private String telefono;
}
