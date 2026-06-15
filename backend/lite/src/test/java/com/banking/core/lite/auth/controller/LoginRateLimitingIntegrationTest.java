package com.banking.core.lite.auth.controller;

import com.banking.core.lite.auth.dto.LoginRequest;
import com.banking.core.lite.auth.entity.Role;
import com.banking.core.lite.auth.entity.RoleName;
import com.banking.core.lite.auth.entity.User;
import com.banking.core.lite.auth.repository.RoleRepository;
import com.banking.core.lite.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Set;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for login rate limiting.
 *
 * RateLimitingService allows 3 tokens per 15-minute window (per email+IP key).
 * Each wrong-password attempt consumes one token.
 * When the bucket is empty the request is rejected with the "Too many attempts" message.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class LoginRateLimitingIntegrationTest {

    // ── Testcontainers ────────────────────────────────────────────────────────

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("core_banking_lite")
            .withUsername("postgres")
            .withPassword("password");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379).toString());
    }

    // ── Spring Beans ──────────────────────────────────────────────────────────

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired PasswordEncoder passwordEncoder;

    /** Mock mail sender — avoids real SMTP calls triggered during registration. */
    @MockitoBean
    JavaMailSender mailSender;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String EMAIL    = "ratelimit@example.com";
    private static final String PASSWORD = "Password123!";

    // ── Setup ─────────────────────────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        roleRepository.deleteAll();

        Role role = new Role();
        role.setName(RoleName.ROLE_USER);
        roleRepository.save(role);

        User user = new User();
        user.setEmail(EMAIL);
        user.setUsername("ratelimituser");
        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setRoles(Set.of(role));
        userRepository.save(user);
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    /**
     * A valid login must always succeed regardless of whether the bucket has been
     * touched for this key — proves the happy path is unaffected by rate limiting.
     */
    @Test
    void testLoginSuccess_noRateLimitApplied() throws Exception {
        LoginRequest request = new LoginRequest(EMAIL, PASSWORD);

        mockMvc.perform(post("/api/v1/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Login successfully"))
                .andExpect(cookie().exists("accessToken"))
                .andExpect(cookie().httpOnly("accessToken", true))
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(cookie().httpOnly("refreshToken", true));
    }

    /**
     * Each wrong-password attempt should consume one token and return a 400
     * that includes the remaining-attempts count in the error message.
     */
    @Test
    void testWrongPassword_consumesTokenAndReturnsRemainingAttempts() throws Exception {
        LoginRequest wrongRequest = new LoginRequest(EMAIL, "WrongPassword!");

        // Attempt 1 — 2 tokens remaining
        mockMvc.perform(post("/api/v1/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Attempts remaining: 2")));

        // Attempt 2 — 1 token remaining
        mockMvc.perform(post("/api/v1/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Attempts remaining: 1")));

        // Attempt 3 — 0 tokens remaining
        mockMvc.perform(post("/api/v1/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Attempts remaining: 0")));
    }

    /**
     * After 3 wrong-password attempts the bucket is empty.
     * The 4th attempt (even with correct credentials) must be rejected with
     * "Too many attempts. Account locked." — confirming the rate limit is enforced.
     */
    @Test
    void testLoginRateLimit_blocksAfterThreeFailedAttempts() throws Exception {
        LoginRequest wrongRequest   = new LoginRequest(EMAIL, "WrongPassword!");
        LoginRequest correctRequest = new LoginRequest(EMAIL, PASSWORD);

        // Exhaust all 3 tokens
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/v1/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(wrongRequest)))
                    .andExpect(status().isBadRequest());
        }

        // 4th attempt — bucket is empty, must be locked regardless of password
        mockMvc.perform(post("/api/v1/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(correctRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Too many attempts. Account locked."));
    }

    /**
     * A successful login must NOT consume a rate-limit token.
     * After one successful login the user should still be able to log in again.
     */
    @Test
    void testSuccessfulLogin_doesNotConsumeRateLimitToken() throws Exception {
        LoginRequest correctRequest = new LoginRequest(EMAIL, PASSWORD);

        // Two consecutive successful logins — should both pass
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/v1/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(correctRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Login successfully"));
        }
    }
}
