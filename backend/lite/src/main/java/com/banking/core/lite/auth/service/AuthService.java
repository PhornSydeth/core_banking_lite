package com.banking.core.lite.auth.service;

import com.banking.core.lite.audit.enumType.AuditAction;
import com.banking.core.lite.audit.enumType.AuditModule;
import com.banking.core.lite.audit.event.AuditEvent;
import com.banking.core.lite.auth.dto.*;
import com.banking.core.lite.auth.entity.RefreshToken;
import com.banking.core.lite.auth.entity.Role;
import com.banking.core.lite.auth.entity.RoleName;
import com.banking.core.lite.auth.entity.User;
import com.banking.core.lite.auth.repository.RefreshTokenRepository;
import com.banking.core.lite.auth.repository.RoleRepository;
import com.banking.core.lite.auth.repository.UserRepository;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import com.banking.core.lite.common.exception.UserNotFoundException;
import com.banking.core.lite.common.exception.ValidationException;
import com.banking.core.lite.common.exception.RateLimitExceededException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TokenBlacklistService blacklistService;
    private final RateLimitingService rateLimitingService;
    private final ApplicationEventPublisher publisher;

    @Transactional
    public RegisterResponse register(RegisterRequest userReq, HttpServletRequest request,
            HttpServletResponse response) {

        if (userRepository.existsByUsername(userReq.username())) {
            throw new ValidationException("Username already exists");
        }
        if (userRepository.existsByEmail(userReq.email())) {
            throw new ValidationException("Email already exists");
        }

        Role userRole = roleRepository
                .findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new ValidationException("Default role not found"));

        User user = new User();
        user.setUsername(userReq.username());
        user.setEmail(userReq.email());
        user.setPassword(passwordEncoder.encode(userReq.password()));
        user.setRoles(Set.of(userRole));
        user = userRepository.save(user);
        // Generate jwt token after use register
        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String ipAddress = extractClientIp(request);
        String deviceInfo = request.getHeader("User-Agent");
        List<RefreshToken> tokens = refreshTokenRepository.findByUserAndDeviceInfo(user, deviceInfo);
        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());
        Instant expiry = jwtService.extractExpiration(newRefreshToken).toInstant();
        RefreshToken refreshToken;
        if (!tokens.isEmpty()) {
            refreshToken = tokens.stream().max(Comparator.comparing(RefreshToken::getId)).get();
            refreshToken.setToken(newRefreshToken);
            refreshToken.setExpiryDate(expiry);
            refreshToken.setIpAddress(ipAddress);
            refreshToken.setRevoked(false);
        } else {
            refreshToken = RefreshToken.builder()
                    .user(user)
                    .token(newRefreshToken)
                    .deviceInfo(deviceInfo)
                    .expiryDate(expiry)
                    .ipAddress(ipAddress)
                    .revoked(false)
                    .build();
        }
        publisher.publishEvent(new UserRegisterEvent(user.getId(),user.getEmail(),user.getUsername()));
        refreshTokenRepository.save(refreshToken);
        addCookie(response, "accessToken", accessToken, 15 * 60);
        addCookie(response, "refreshToken", newRefreshToken, 7 * 24 * 60 * 60);

        // ── Audit: USER_REGISTER ─────────────────────────────────────────────
        publisher.publishEvent(AuditEvent.builder()
                .module(AuditModule.AUTH)
                .action(AuditAction.USER_REGISTER)
                .userId(user.getId())
                .performedBy(user.getEmail())
                .targetEntity("User")
                .targetEntityId(user.getId().toString())
                .details("User registered: " + user.getUsername())
                .ipAddress(ipAddress)
                .deviceInfo(deviceInfo)
                .success(true)
                .build());

        return new RegisterResponse(user.getUsername(), user.getEmail());

    }



    @Transactional
    public void login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse response) {
        // ── Step 1: resolve the rate-limit bucket BEFORE authentication ──────────
        // Key is scoped per email + client IP so different IPs get independent buckets.
        String ipAddress = extractClientIp(httpRequest);
        String key = "login_limit:" + request.email() + ":" + ipAddress;
        Bucket bucket = rateLimitingService.resolveBucket(key);

        // ── Step 2: reject immediately if the bucket is already empty ────────────
        if (bucket.getAvailableTokens() <= 0) {
            throw new RateLimitExceededException("Too many attempts. Account locked.");
        }

        // ── Step 3: attempt authentication — consume a token on any failure ──────
        // authenticate() throws BadCredentialsException (and others) on wrong
        // credentials, so we must wrap it to intercept the exception and apply
        // the rate-limit penalty before re-throwing a user-friendly message.
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (Exception ex) {
            bucket.tryConsume(1);
            long remaining = bucket.getAvailableTokens();

            // ── Audit: USER_LOGIN_FAILED ─────────────────────────────────────
            publisher.publishEvent(AuditEvent.builder()
                    .module(AuditModule.AUTH)
                    .action(AuditAction.USER_LOGIN_FAILED)
                    .performedBy(request.email())
                    .details("Failed login attempt. Remaining: " + remaining)
                    .ipAddress(ipAddress)
                    .deviceInfo(httpRequest.getHeader("User-Agent"))
                    .success(false)
                    .errorMessage("Invalid credentials")
                    .build());

            throw new ValidationException("Invalid credentials. Attempts remaining: " + remaining);
        }

        // ── Step 4: authentication succeeded — build tokens ──────────────────────
        User user = userRepository.findByEmail(request.email()).orElseThrow(()->new UserNotFoundException(request.email()));

        String accessToken = jwtService.generateAccessToken(user.getEmail());

        String deviceInfo = httpRequest.getHeader("User-Agent");
        List<RefreshToken> tokens = refreshTokenRepository.findByUserAndDeviceInfo(user, deviceInfo);
        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());
        Instant expiry = jwtService.extractExpiration(newRefreshToken).toInstant();
        RefreshToken refreshToken;
        if (!tokens.isEmpty()) {
            refreshToken = tokens.stream().max(Comparator.comparing(RefreshToken::getId)).get();
            refreshToken.setToken(newRefreshToken);
            refreshToken.setExpiryDate(expiry);
            refreshToken.setIpAddress(ipAddress);
            refreshToken.setRevoked(false);
        } else {
            refreshToken = RefreshToken.builder()
                    .user(user)
                    .token(newRefreshToken)
                    .deviceInfo(deviceInfo)
                    .expiryDate(expiry)
                    .ipAddress(ipAddress)
                    .revoked(false)
                    .build();
        }
        refreshTokenRepository.save(refreshToken);
        addCookie(response, "accessToken", accessToken, 15 * 60);
        addCookie(response, "refreshToken", newRefreshToken, 7 * 24 * 60 * 60);

        // ── Audit: USER_LOGIN ────────────────────────────────────────────────
        publisher.publishEvent(AuditEvent.builder()
                .module(AuditModule.AUTH)
                .action(AuditAction.USER_LOGIN)
                .userId(user.getId())
                .performedBy(user.getEmail())
                .targetEntity("User")
                .targetEntityId(user.getId().toString())
                .details("Successful login")
                .ipAddress(ipAddress)
                .deviceInfo(deviceInfo)
                .success(true)
                .build());
    }

    @Transactional
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) {
        // 1 Extract Refresh Token from cookies
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equalsIgnoreCase(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }
        if (refreshToken == null) {
            throw new ValidationException("refresh token missing");
        }
        // 2 Find token in DB
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ValidationException("Invalid refresh token"));
        // 3 Validate DB state
        if (storedToken.isRevoked()) {
            throw new ValidationException("Token revoked");
        }
        if (storedToken.getExpiryDate().isBefore(Instant.now())) {
            throw new ValidationException("Token expired");
        }
        // 4 validate JWT
        User user = storedToken.getUser();
        // ROTATION (VERY IMPORTANT)
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);
        // generate new refresh token
        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());
        Date expiry = jwtService.extractExpiration(newRefreshToken);
        RefreshToken newToken = RefreshToken.builder()
                .user(user)
                .token(newRefreshToken)
                .expiryDate(expiry.toInstant())
                .deviceInfo(storedToken.getDeviceInfo())
                .ipAddress(storedToken.getIpAddress())
                .revoked(false)
                .build();
        refreshTokenRepository.save(newToken);
        // Generate new access token
        String newAccessToken = jwtService.generateAccessToken(user.getEmail());
        // set cookies
        addCookie(response, "accessToken", newAccessToken, 15 * 60); // 15 min
        addCookie(response, "refreshToken", newRefreshToken, 7 * 24 * 60 * 60); // 7 days

    }

    private void addCookie(HttpServletResponse response,
            String name,
            String value,
            int maxAge) {

        String cookie = String.format(
                "%s=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=Lax",
                name,
                value,
                maxAge);

        response.addHeader("Set-Cookie", cookie);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = extractTokenFromCookie(request, "accessToken");
        String refreshToken = extractTokenFromCookie(request, "refreshToken");
        if (refreshToken != null) {
            refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
            // 3. Blacklist access token (Redis)
            if (accessToken != null && jwtService.isTokenValid(accessToken)) {
                long expiration = jwtService.getRemainingExpiration(accessToken);
                blacklistService.blacklistToken(accessToken, expiration);
            }

            // 4. Clear cookies
            clearCookie(response, "accessToken");
            clearCookie(response, "refreshToken");

            // ── Audit: USER_LOGOUT ───────────────────────────────────────────
            publisher.publishEvent(AuditEvent.builder()
                    .module(AuditModule.AUTH)
                    .action(AuditAction.USER_LOGOUT)
                    .performedBy(accessToken != null && jwtService.isTokenValid(accessToken)
                            ? jwtService.extractUsername(accessToken) : "unknown")
                    .details("User logged out")
                    .success(true)
                    .build());
        }

    }

    private String extractTokenFromCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null)
            return null;
        for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals(name)) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

}
