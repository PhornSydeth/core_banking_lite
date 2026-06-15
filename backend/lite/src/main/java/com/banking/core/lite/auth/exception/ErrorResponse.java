package com.banking.core.lite.auth.exception;

import lombok.Data;

import java.time.Instant;
import java.util.Date;

@Data
public class ErrorResponse {
    private int status;
    private String message;
    private Instant timestamp;
    public ErrorResponse(int status,String message){
        this.status=status;
        this.message=message;
        this.timestamp=Instant.now();
    }
}
