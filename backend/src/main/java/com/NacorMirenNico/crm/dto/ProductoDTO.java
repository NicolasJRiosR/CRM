package com.NacorMirenNico.crm.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoDTO {
    private Integer id;

    @NotBlank @Size(max = 150)
    private String nombre;

    @NotNull @PositiveOrZero
    private Integer stock;

    @NotNull @PositiveOrZero
    private BigDecimal precio;

    @NotNull
    private Integer proveedorId;
}
