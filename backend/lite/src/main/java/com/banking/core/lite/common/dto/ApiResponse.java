package com.banking.core.lite.common.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.validation.FieldError;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class ApiResponse<T> {
    private boolean success;
    private int code;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String traceId;
    private List<ApiFieldError> fieldErrors;

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(200)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                // .traceId(MDC.get("traceId")) // Omit MDC for now unless we need structured logging in this step
                .build();
    }

    public static ApiResponse<?> error(int code, String message) {
        return ApiResponse.builder()
                .success(false)
                .code(code)
                .message(message)
                .timestamp(LocalDateTime.now())
                // .traceId(MDC.get("traceId"))
                .build();
    }

    @Data
    public static class ApiFieldError {
        private String field;
        private String message;
        private Object rejectedValue;

        public ApiFieldError(String field, String message, Object rejectedValue) {
            this.field = field;
            this.message = message;
            this.rejectedValue = rejectedValue;
        }
        
        public static ApiFieldError fromFieldError(FieldError fieldError) {
            return new ApiFieldError(
                fieldError.getField(),
                fieldError.getDefaultMessage(),
                fieldError.getRejectedValue()
            );
        }
    }
}
