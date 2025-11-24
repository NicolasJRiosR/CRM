package com.NacorMirenNico.crm.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InteraccionDTO {
    private Integer id;

    @NotNull(message = "El cliente es obligatorio")
    private Integer clienteId;

    @NotBlank(message = "El tipo de interacción es obligatorio")
    private String tipo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotNull(message = "La fecha y hora son obligatorias")
    private LocalDateTime fechaHora;
}
