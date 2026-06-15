package com.banking.core.lite.auth.security;

import com.banking.core.lite.auth.service.JwtService;
import com.banking.core.lite.auth.service.TokenBlacklistService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService blacklistService;

    /**
     * Public endpoints that must never be intercepted by this filter.
     * The refresh endpoint in particular must NOT have its cookies parsed here —
     * it reads the refreshToken cookie itself, and calling extractUsername() on
     * an expired accessToken cookie would just produce a misleading error log.
     */
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/v1/login",
            "/api/v1/register",
            "/api/v1/refresh",
            "/api/v1/sendOtp",
            "/api/v1/changePass",
            "/api/v1/verifyIdentity"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return PUBLIC_PATHS.stream().anyMatch(path::equalsIgnoreCase);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String accessToken = extractCookie(request, "accessToken");
        String username = null;

        if (accessToken != null) {
            try {
                if (blacklistService.isBlacklisted(accessToken)) {
                    filterChain.doFilter(request, response);
                    return;
                }
                username = jwtService.extractUsername(accessToken);
            } catch (JwtException e) {
                logger.error("JWT validation failed: " + e.getMessage());
            }
        }

        // Authenticate only when we have a valid, non-blacklisted token
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtService.isTokenValid(accessToken, userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equalsIgnoreCase(cookie.getName())) return cookie.getValue();
        }
        return null;
    }
}
