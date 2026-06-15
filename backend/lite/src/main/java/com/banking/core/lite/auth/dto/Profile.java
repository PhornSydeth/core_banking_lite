package com.banking.core.lite.auth.dto;

import lombok.*;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Profile{
    private UUID userId;
    private String username;
    private String email;
    private boolean isVerified;
}
