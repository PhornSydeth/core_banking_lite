package com.banking.core.lite.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

        @Value("${app.jwt.secret}")
        private String secretKey;

        @Value("${app.jwt.access-expiration-ms}")
        private long jwtExpiration;

        @Value("${app.jwt.refresh-expiration-ms}")
        private long refreshExpiration;
    private Key getSignKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // ===============================
    // Generate Token
    // ===============================
    public String generateAccessToken(String username) {
        return buildToken(username, jwtExpiration); // 5 min
    }

    public String generateRefreshToken(String username) {
        return buildToken(username, refreshExpiration); // 7 days
    }

    private String buildToken(String username, long expiration) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ===============================
    // Extract Info
    // ===============================
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()                 // Use parser() instead of parserBuilder()
                .verifyWith((SecretKey) getSignKey())    // Use verifyWith() instead of setSigningKey()
                .build()
                .parseSignedClaims(token)    // Use parseSignedClaims() instead of parseClaimsJws()
                .getPayload();               // Use getPayload() instead of getBody()
    }
    // ===============================

    // Validation
    // ===============================
    public boolean isTokenValid(String token, String username) {
        return username.equals(extractUsername(token)) && !isTokenExpired(token);
    }
    public boolean isTokenValid(String token){
        return !isTokenExpired(token);
    }
    public long getRemainingExpiration(String token) {
        Date expiration = extractExpiration(token);
        long remaining = expiration.getTime() - System.currentTimeMillis();
        return Math.max(remaining, 0);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }




}



