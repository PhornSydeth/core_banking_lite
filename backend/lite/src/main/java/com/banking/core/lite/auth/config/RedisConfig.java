package com.banking.core.lite.auth.config;

import io.lettuce.core.RedisClient;
import io.lettuce.core.cluster.ClusterClientOptions;
import io.lettuce.core.cluster.ClusterTopologyRefreshOptions;
import org.springframework.boot.data.redis.autoconfigure.LettuceClientConfigurationBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisClusterConfiguration;
import org.springframework.data.redis.connection.RedisConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }

//    @Bean
//    public RedisConnectionFactory redisConnectionFactory() {
//        // Lettuce is the default, thread-safe production client for Spring Boot
//        return new LettuceConnectionFactory();
//    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        // This bean will be injected into your PasswordResetService
        return new StringRedisTemplate(connectionFactory);
    }
    @Bean
    public RedisClusterConfiguration redisClusterConfiguration() {
        RedisClusterConfiguration clusterConfig = new RedisClusterConfiguration();
        clusterConfig.clusterNode("redis-connection-odtybu.serverless.apse2.cache.amazonaws.com", 6379);
        return clusterConfig;
    }
    // 2. This Customizer automatically intercepts Spring Boot's internal builder
    // and turns off dynamic node discoveries safely without needing .clientOptions()
    @Bean
    public LettuceClientConfigurationBuilderCustomizer lettuceClientConfigurationBuilderCustomizer() {
        return builder -> {
            ClusterTopologyRefreshOptions topologyOptions = ClusterTopologyRefreshOptions.builder()
                    .dynamicRefreshSources(false) // CRITICAL FOR AWS SERVERLESS
                    .build();

            ClusterClientOptions clientOptions = ClusterClientOptions.builder()
                    .topologyRefreshOptions(topologyOptions)
                    .build();

            // Intercepts the build parameters internally
            builder.clientOptions(clientOptions);
        };
    }
}
