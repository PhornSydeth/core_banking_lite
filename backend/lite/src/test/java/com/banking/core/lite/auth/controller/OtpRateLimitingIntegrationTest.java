package com.banking.core.lite.auth.controller;

import com.banking.core.lite.auth.entity.Role;
import com.banking.core.lite.auth.entity.RoleName;
import com.banking.core.lite.auth.entity.User;
import com.banking.core.lite.auth.repository.RoleRepository;
import com.banking.core.lite.auth.repository.UserRepository;
import com.banking.core.lite.auth.service.OTPService;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for OTP send rate limiting.
 *
 * The /api/v1/sendOtp endpoint is protected by Bucket4j:
 *   - 3 tokens per 15-minute window, keyed on email + client IP.
 *   - Exceeding the limit returns HTTP 429 with a descriptive message.
 *
 * OTPService (Twilio) is mocked so no external HTTP calls are made.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class OtpRateLimitingIntegrationTest {

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

    /** Mock OTPService — prevents real Twilio API calls during tests. */
    @MockitoBean
    OTPService otpService;

    /** Mock mail sender — prevents SMTP calls triggered by register flow. */
    @MockitoBean JavaMailSender mailSender;

    private static final String EMAIL = "otpuser@example.com";

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
        user.setUsername("otpuser");
        user.setPassword(passwordEncoder.encode("Password123!"));
        user.setRoles(Set.of(role));
        userRepository.save(user);

        // Default mock — OTPService returns true (success) for any email
        when(otpService.sendEmailOtp(anyString())).thenReturn(true);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void performSendOtp(String email) throws Exception {
        mockMvc.perform(post("/api/v1/sendOtp")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\"}"));
    }

    private org.springframework.test.web.servlet.ResultActions sendOtpRequest(String email) throws Exception {
        return mockMvc.perform(post("/api/v1/sendOtp")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\"}"));
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    /**
     * A single OTP request for a known email must succeed (HTTP 200)
     * and delegate to OTPService exactly once.
     */
    @Test
    void testSendOtp_firstRequest_succeeds() throws Exception {
        sendOtpRequest(EMAIL)
                .andExpect(status().isOk())
                .andExpect(content().string("OTP sent successfully"));

        verify(otpService, times(1)).sendEmailOtp(EMAIL);
    }

    /**
     * Three consecutive OTP requests within the 15-minute window must all
     * succeed — the bucket starts with 3 tokens so all three are within the limit.
     */
    @Test
    void testSendOtp_threeRequests_allSucceed() throws Exception {
        for (int i = 0; i < 3; i++) {
            sendOtpRequest(EMAIL)
                    .andExpect(status().isOk())
                    .andExpect(content().string("OTP sent successfully"));
        }

        // OTPService must have been called exactly 3 times
        verify(otpService, times(3)).sendEmailOtp(EMAIL);
    }

    /**
     * The 4th OTP request within the same 15-minute window must be rejected
     * with HTTP 429 (Too Many Requests) and a descriptive message.
     * OTPService must NOT be called for the blocked request.
     */
    @Test
    void testSendOtp_fourthRequest_isRateLimited() throws Exception {
        // Exhaust all 3 allowed tokens
        for (int i = 0; i < 3; i++) {
            sendOtpRequest(EMAIL).andExpect(status().isOk());
        }

        // 4th request — bucket is empty → must be rejected
        sendOtpRequest(EMAIL)
                .andExpect(status().isTooManyRequests())
                .andExpect(content().string(containsString("Too many OTP requests")));

        // OTPService must only have been called for the 3 allowed requests
        verify(otpService, times(3)).sendEmailOtp(EMAIL);
    }

    /**
     * Rate limiting is applied per email+IP combination.
     * Requests for different emails must not share the same bucket,
     * so a second email should still be allowed even after the first is rate-limited.
     */
    @Test
    void testSendOtp_differentEmails_haveSeparateBuckets() throws Exception {
        String emailA = EMAIL;
        String emailB = "another@example.com";

        // Exhaust bucket for emailA
        for (int i = 0; i < 3; i++) {
            sendOtpRequest(emailA).andExpect(status().isOk());
        }

        // emailA is now rate-limited
        sendOtpRequest(emailA)
                .andExpect(status().isTooManyRequests());

        // emailB still has its own fresh bucket — must succeed
        sendOtpRequest(emailB)
                .andExpect(status().isOk())
                .andExpect(content().string("OTP sent successfully"));
    }

    /**
     * When OTPService is unavailable / returns false the endpoint should
     * still return HTTP 200 (the controller delegates and does not fail the
     * request based on the Twilio response), but the rate-limit token IS consumed.
     * After 3 such failures the 4th request is still rate-limited.
     */
    @Test
    void testSendOtp_otpServiceFailure_stillConsumesRateLimitToken() throws Exception {
        when(otpService.sendEmailOtp(anyString())).thenReturn(false);

        // 3 requests where OTPService fails — tokens are still consumed
        for (int i = 0; i < 3; i++) {
            sendOtpRequest(EMAIL).andExpect(status().isOk());
        }

        // 4th request — rate limited regardless of OTPService result
        sendOtpRequest(EMAIL)
                .andExpect(status().isTooManyRequests())
                .andExpect(content().string(containsString("Too many OTP requests")));
    }
}
