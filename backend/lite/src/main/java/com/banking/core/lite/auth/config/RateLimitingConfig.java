package com.banking.core.lite.auth.config;

import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.RedisCodec;
import io.lettuce.core.codec.StringCodec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class RateLimitingConfig {

    /**
     * Read host/port from Spring properties so that both the main application
     * (application.yml) and integration tests (Testcontainers @DynamicPropertySource)
     * use the same Redis instance as the rest of the application context.
     *
     * Previously this was hardcoded to localhost:6379, which meant the Bucket4j
     * ProxyManager connected to a different Redis than the one started by
     * Testcontainers, causing buckets to never be found/stored during tests.
     */
    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;
    @Value("${spring.data.redis.password}")
    private String password;

    @Bean
    public RedisClient redisClient() {
        RedisURI redisURI=RedisURI.builder()
                .withHost(redisHost)
                .withPort(redisPort)
                .withPassword(password.toCharArray())
                .withSsl(true)
                .build();
        return RedisClient.create(redisURI);
    }

    @Bean
    public ProxyManager<String> proxyManager(RedisClient redisClient) {
        StatefulRedisConnection<String, byte[]> connection = redisClient
                .connect(RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE));

        return LettuceBasedProxyManager.builderFor(connection)
                .withExpirationStrategy(ExpirationAfterWriteStrategy
                        .basedOnTimeForRefillingBucketUpToMax(Duration.ofMinutes(15)))
                .build();
    }
}
