package com.NacorMirenNico.crm.web;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
@RestControllerAdvice
public class ErrorHandler {

    // Estructura para errores de campo
    public record Violation(String field, String message) {}

    // Estructura para el cuerpo de error completo
    public record ApiError(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        List<Violation> violations
    ) {}

    // 404: recurso no encontrado
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiError> notFound(NoSuchElementException ex, org.springframework.web.context.request.WebRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req, List.of());
    }

    // 409: violación de restricción única o integridad
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> conflict(DataIntegrityViolationException ex, org.springframework.web.context.request.WebRequest req) {
        return build(HttpStatus.CONFLICT, "Violación de integridad de datos", req, List.of());
    }

    // 400: error de validación de campos
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex, org.springframework.web.context.request.WebRequest req) {
        List<Violation> v = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> new Violation(fe.getField(), fe.getDefaultMessage()))
            .collect(Collectors.toList());
        return build(HttpStatus.BAD_REQUEST, "Validación fallida", req, v);
    }
    // 400: error de lógica interna (ej. stock insuficiente)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> badRequest(IllegalArgumentException ex, org.springframework.web.context.request.WebRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req, List.of());
    }  
    private ResponseEntity<ApiError> build(HttpStatus status, String msg, org.springframework.web.context.request.WebRequest req, List<Violation> v) {
        ApiError body = new ApiError(
            OffsetDateTime.now(),
            status.value(),
            status.getReasonPhrase(),
            msg,
            Optional.ofNullable(req.getDescription(false)).orElse(""),
            v
        );
        return ResponseEntity.status(status).body(body);
    }
}
