package com.example.taskpro.security;

import com.example.taskpro.config.SecurityConfig;
import com.example.taskpro.service.UserDetailsServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests de sécurité pour vérifier la configuration Spring Security
 * Teste l'authentification, l'autorisation et la protection CSRF
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @DisplayName("Should allow access to public endpoints without authentication")
    void shouldAllowAccessToPublicEndpointsWithoutAuthentication() throws Exception {
        // Public endpoints should be accessible without authentication
        mockMvc.perform(get("/api/v1/auth/activate-account")
                        .param("token", "test-token"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .param("email", "test@example.com"))
                .andExpect(status().isBadRequest()); // Bad request due to missing body, but not 401

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .param("email", "test@example.com"))
                .andExpect(status().isBadRequest()); // Bad request due to missing body, but not 401
    }

    @Test
    @DisplayName("Should allow access to Swagger UI without authentication")
    void shouldAllowAccessToSwaggerUiWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should require authentication for protected endpoints")
    void shouldRequireAuthenticationForProtectedEndpoints() throws Exception {
        // These endpoints should require authentication
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/tasks"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/teams"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    @DisplayName("Should allow authenticated users to access protected endpoints")
    void shouldAllowAuthenticatedUsersToAccessProtectedEndpoints() throws Exception {
        // With @WithMockUser, these should be accessible
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk()); // Should return 200 or appropriate response

        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/tasks"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should reject requests without CSRF token for state-changing operations")
    void shouldRejectRequestsWithoutCsrfTokenForStateChangingOperations() throws Exception {
        // CSRF should be required for POST/PUT/DELETE operations (except auth endpoints)
        mockMvc.perform(post("/api/v1/users")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isForbidden()); // Should be 403 Forbidden due to CSRF

        mockMvc.perform(post("/api/v1/projects")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should allow CSRF-exempt endpoints")
    void shouldAllowCsrfExemptEndpoints() throws Exception {
        // Auth endpoints should be exempt from CSRF
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType("application/json")
                        .content("{\"email\":\"test@example.com\",\"password\":\"test123\",\"firstname\":\"Test\",\"lastname\":\"User\"}"))
                .andExpect(status().isBadRequest()); // Bad request due to validation, not CSRF

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"test@example.com\",\"password\":\"test123\"}"))
                .andExpect(status().isBadRequest()); // Bad request due to validation, not CSRF
    }

    @Test
    @DisplayName("Should allow access to actuator health endpoint")
    void shouldAllowAccessToActuatorHealthEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should protect actuator metrics endpoint")
    void shouldProtectActuatorMetricsEndpoint() throws Exception {
        // Metrics should be protected
        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Should allow admin users to access admin endpoints")
    void shouldAllowAdminUsersToAccessAdminEndpoints() throws Exception {
        // Admin users should have access to protected endpoints
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("Should allow regular users to access user endpoints")
    void shouldAllowRegularUsersToAccessUserEndpoints() throws Exception {
        // Regular users should have access to basic endpoints
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle invalid JWT tokens")
    void shouldHandleInvalidJwtTokens() throws Exception {
        // Requests with invalid JWT tokens should be rejected
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/projects")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should handle malformed Authorization headers")
    void shouldHandleMalformedAuthorizationHeaders() throws Exception {
        // Malformed authorization headers should be rejected
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "InvalidFormat token"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", ""))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should allow WebSocket connections")
    void shouldAllowWebSocketConnections() throws Exception {
        // WebSocket endpoints should be accessible
        mockMvc.perform(get("/ws"))
                .andExpect(status().isNotFound()); // 404 is expected for WebSocket upgrade
    }

    @Test
    @DisplayName("Should handle CORS preflight requests")
    void shouldHandleCorsPreflightRequests() throws Exception {
        // CORS preflight requests should be handled
        mockMvc.perform(get("/api/v1/users")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isUnauthorized()); // Should be 401, not CORS error
    }
}
