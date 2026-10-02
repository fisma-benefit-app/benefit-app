package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.repository.AppUserRepository;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowIntegrationTest {

  private static final String PASSWORD = "integration-test-password";

  @Autowired private MockMvc mockMvc;
  @Autowired private AppUserRepository appUserRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private JdbcTemplate jdbcTemplate;
  @Autowired private LoginAttemptThrottleService loginAttemptThrottleService;

  private String username;
  private AppUser testUser;

  @BeforeEach
  void createTestUser() {
    jdbcTemplate.execute(
        "CREATE TABLE IF NOT EXISTS app_users ("
            + "id BIGSERIAL PRIMARY KEY, "
            + "username VARCHAR(50) NOT NULL, "
            + "password VARCHAR(64) NOT NULL, "
            + "deleted_at TIMESTAMP(0))");
    jdbcTemplate.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS app_users_username_lower_key "
            + "ON app_users (LOWER(username))");

    username = "auth-it-" + UUID.randomUUID();
    testUser =
        appUserRepository.save(new AppUser(null, username, passwordEncoder.encode(PASSWORD), null));
  }

  @AfterEach
  void deleteTestUser() {
    loginAttemptThrottleService.reset(username);
    if (testUser != null && testUser.getId() != null) {
      appUserRepository.deleteById(testUser.getId());
    }
  }

  @Test
  void loginIssuesSignedTokenAcceptedByJwtValidationEndpoint() throws Exception {
    String token = login(PASSWORD);

    mockMvc
        .perform(get("/auth/validateJWT").header("Authorization", bearer(token)))
        .andExpect(status().isOk());
  }

  @Test
  void renewalRevokesCurrentTokenAndKeepsRenewedTokenValid() throws Exception {
    String currentToken = login(PASSWORD);

    MvcResult renewalResult =
        mockMvc
            .perform(post("/token").header("Authorization", bearer(currentToken)))
            .andExpect(status().isOk())
            .andReturn();
    String renewedToken = tokenFrom(renewalResult);

    mockMvc
        .perform(get("/auth/validateJWT").header("Authorization", bearer(currentToken)))
        .andExpect(status().isUnauthorized());
    mockMvc
        .perform(get("/auth/validateJWT").header("Authorization", bearer(renewedToken)))
        .andExpect(status().isOk());
  }

  @Test
  void logoutRevokesToken() throws Exception {
    String token = login(PASSWORD);

    mockMvc
        .perform(post("/auth/logout").header("Authorization", bearer(token)))
        .andExpect(status().isOk());
    mockMvc
        .perform(get("/auth/validateJWT").header("Authorization", bearer(token)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void fifthFailedLoginIsThrottledAndSubsequentAttemptRemainsBlocked() throws Exception {
    for (int attempt = 1; attempt < 5; attempt++) {
      mockMvc
          .perform(post("/token").with(httpBasic(username, "wrong-password")))
          .andExpect(status().isUnauthorized());
    }

    mockMvc
        .perform(post("/token").with(httpBasic(username, "wrong-password")))
        .andExpect(status().isTooManyRequests());
    mockMvc
        .perform(post("/token").with(httpBasic(username, PASSWORD)))
        .andExpect(status().isTooManyRequests());
  }

  private String login(String password) throws Exception {
    MvcResult result =
        mockMvc
            .perform(post("/token").with(httpBasic(username, password)))
            .andExpect(status().isOk())
            .andReturn();
    return tokenFrom(result);
  }

  private static String tokenFrom(MvcResult result) {
    String authorization = result.getResponse().getHeader("Authorization");
    assertThat(authorization).startsWith("Bearer ");
    return authorization.substring("Bearer ".length());
  }

  private static String bearer(String token) {
    return "Bearer " + token;
  }
}
