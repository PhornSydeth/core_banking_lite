package com.banking.core.lite.auth.service;

import java.time.Duration;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

        private final StringRedisTemplate redisTemplate;

        public void blacklistToken(String token, long expirationMillis) {
            redisTemplate.opsForValue().set(
                    token,
                    "blacklisted",
                    Duration.ofMillis(expirationMillis)
            );
        }

        public boolean isBlacklisted(String token) {
            return redisTemplate.hasKey(token);
        }

}
