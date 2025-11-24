package com.NacorMirenNico.crm.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VentaDTO {
    private Integer id;
    private Integer clienteId;
    private Integer productoId;
    private LocalDate fecha;
    private int cantidad;
    private BigDecimal precioUnitario;
}
