package com.banking.core.lite.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

// @ControllerAdvice // Disabled in favor of common GlobalExceptionHandler
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex){
        ErrorResponse response=new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),ex.getMessage()
        );
        return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleRateLimit(ResponseStatusException ex) {
        // Force the status and return a clear message
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(ex.getReason());
    }

}
