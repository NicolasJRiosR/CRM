package com.NacorMirenNico.crm.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MovimientoStockRequest(
    @NotNull Integer productoId,
    @NotNull Integer entidadId,    // clienteId para ventas, proveedorId para compras
    @Positive Integer cantidad,
    @NotNull @Positive BigDecimal precioUnitario
) {}
