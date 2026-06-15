package com.banking.core.lite.auth.controller;

import com.banking.core.lite.auth.dto.*;
import com.banking.core.lite.auth.service.AuthService;
import com.banking.core.lite.auth.service.OTPService;
import com.banking.core.lite.auth.service.RateLimitingService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@Validated
@RequestMapping("/api/v1")
public class AuthController {

    private final AuthService authService;
    private final OTPService otpService;
    private final RateLimitingService rateLimitingService;

    public AuthController(AuthService authService, OTPService otpService, RateLimitingService rateLimitingService) {
        this.authService = authService;
        this.otpService = otpService;
        this.rateLimitingService = rateLimitingService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest userRequest, HttpServletRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.register(userRequest, request, response));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse response
    ) {
        authService.login(request, httpRequest, response);
        return ResponseEntity.ok("Login successfully");
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(HttpServletRequest request, HttpServletResponse response) {
        authService.refreshToken(request, response);
        return ResponseEntity.ok("Token refresh successfully");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        authService.logout(httpRequest, httpResponse);
        return ResponseEntity.ok("Logout successfully");
    }

    /**
     * Send OTP — rate limited to 3 requests per email per 15 minutes.
     * Uses the same Bucket4j ProxyManager used by the login flow.
     */
    @PostMapping("/sendOtp")
    public ResponseEntity<String> sendOtp(@RequestBody Map<String, String> req, HttpServletRequest httpRequest) {
        String email = req.get("email");
        String ip    = httpRequest.getHeader("X-Forwarded-For") != null
                ? httpRequest.getHeader("X-Forwarded-For").split(",")[0]
                : httpRequest.getRemoteAddr();
        String key   = "otp_limit:" + email + ":" + ip;

        Bucket bucket = rateLimitingService.resolveBucket(key);
        if (!bucket.tryConsume(1)) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many OTP requests. Please wait before requesting again."
            );
        }

        otpService.sendEmailOtp(email);
        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/changePass")
    public ResponseEntity<String> changePass(@RequestBody Map<String, String> request) {
        String email   = request.get("email");
        String otp     = request.get("otp");
        String newPass = request.get("newPass");
        otpService.changePass(email, otp, newPass);
        return ResponseEntity.ok("Password changed successfully");
    }
    @PostMapping("/verify")
    public ResponseEntity<String> verify(@RequestBody Map<String,String> request){
        String email=request.get("email");
        String otp=request.get("otp");
        otpService.verify(email,otp);
        return ResponseEntity.ok("Account verify successfully");
    }

}
