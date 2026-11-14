package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.domain.EnumUserRole;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.RevokedTokenRepository;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
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
  @Autowired private RevokedTokenRepository revokedTokenRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private JdbcTemplate jdbcTemplate;
  @Autowired private LoginAttemptThrottleService loginAttemptThrottleService;
  @Autowired private TokenBlacklistService tokenBlacklistService;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private JwtDecoder jwtDecoder;

  private String username;
  private String unknownUsername;
  private String revokedJti;
  private AppUser testUser;

  @BeforeEach
  void createTestUser() {
    jdbcTemplate.execute(
        "CREATE TABLE IF NOT EXISTS revoked_tokens ("
            + "jti VARCHAR PRIMARY KEY, "
            + "expires_at TIMESTAMP WITH TIME ZONE NOT NULL)");
    jdbcTemplate.execute(
        "CREATE TABLE IF NOT EXISTS app_users ("
            + "id BIGSERIAL PRIMARY KEY, "
            + "username VARCHAR(50) NOT NULL, "
            + "password VARCHAR(64) NOT NULL, "
            + "role VARCHAR(20) NOT NULL DEFAULT 'USER', "
            + "deleted_at TIMESTAMP(0))");
    jdbcTemplate.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS app_users_username_lower_key "
            + "ON app_users (LOWER(username))");

    username = "auth-it-" + UUID.randomUUID();
    testUser =
        appUserRepository.save(
            new AppUser(null, username, passwordEncoder.encode(PASSWORD), EnumUserRole.USER, null));
  }

  @AfterEach
  void deleteTestUser() {
    loginAttemptThrottleService.reset(username);
    if (unknownUsername != null) {
      loginAttemptThrottleService.reset(unknownUsername);
    }
    if (revokedJti != null) {
      revokedTokenRepository.deleteById(revokedJti);
    }
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

  @ParameterizedTest
  @ValueSource(strings = {"Bearer", "bearer", "BEARER", "bEaReR"})
  void logoutRevokesTokenForEveryAcceptedSchemeCasing(String logoutScheme) throws Exception {
    String token = login(PASSWORD);
    revokedJti = jwtDecoder.decode(token).getId();

    mockMvc
        .perform(get("/auth/validateJWT").header("Authorization", logoutScheme + " " + token))
        .andExpect(status().isOk());

    mockMvc
        .perform(post("/auth/logout").header("Authorization", logoutScheme + " " + token))
        .andExpect(status().isNoContent());
    assertThat(revokedTokenRepository.existsById(revokedJti)).isTrue();

    for (String scheme : new String[] {"Bearer", "bearer", "BEARER", "bEaReR"}) {
      String authorization = scheme + " " + token;
      mockMvc
          .perform(get("/auth/validateJWT").header("Authorization", authorization))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.error").value("Token has been revoked"));
      mockMvc
          .perform(get("/projects").header("Authorization", authorization))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.error").value("Token has been revoked"));
      mockMvc
          .perform(post("/token").header("Authorization", authorization))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.error").value("Token has been revoked"))
          .andExpect(header().doesNotExist("Authorization"));
    }
  }

  @ParameterizedTest
  @ValueSource(strings = {"Bearer", "bearer", "BEARER", "bEaReR"})
  void invalidTokensAndMalformedBearerHeadersAreDenied(String scheme) throws Exception {
    String token = login(PASSWORD);
    int signatureStart = token.lastIndexOf('.') + 1;
    String invalidSignature =
        token.substring(0, signatureStart)
            + (token.charAt(signatureStart) == 'A' ? 'B' : 'A')
            + token.substring(signatureStart + 1);

    for (String value : new String[] {"", "token with spaces", "not-a-jwt", invalidSignature}) {
      String authorization = scheme + " " + value;
      mockMvc
          .perform(get("/auth/validateJWT").header("Authorization", authorization))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.error").value("Invalid token"));
      mockMvc
          .perform(post("/auth/logout").header("Authorization", authorization))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.error").value("Invalid token"));
      mockMvc
          .perform(post("/token").header("Authorization", authorization))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.error").value("Invalid token"))
          .andExpect(header().doesNotExist("Authorization"));
    }
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

  @Test
  void unknownUsernameIsThrottledAfterFiveFailedAttempts() throws Exception {
    unknownUsername = "unknown-it-" + UUID.randomUUID();
    String wrongPasswordBody =
        mockMvc
            .perform(post("/token").with(httpBasic(username, "wrong-password")))
            .andExpect(status().isUnauthorized())
            .andReturn()
            .getResponse()
            .getContentAsString();

    for (int attempt = 1; attempt < 5; attempt++) {
      var response =
          mockMvc
              .perform(post("/token").with(httpBasic(unknownUsername, "wrong-password")))
              .andExpect(status().isUnauthorized())
              .andReturn()
              .getResponse();

      assertThat(response.getContentAsString()).isEqualTo(wrongPasswordBody);
    }

    mockMvc
        .perform(post("/token").with(httpBasic(unknownUsername, "wrong-password")))
        .andExpect(status().isTooManyRequests());
    assertThat(loginAttemptThrottleService.isBlocked(unknownUsername)).isTrue();
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

  @Test
  void removedProfileUpdateCannotChangePassword() throws Exception {
    String token = login(PASSWORD);
    mockMvc
        .perform(
            put("/appusers/" + testUser.getId())
                .header("Authorization", bearer(token))
                .contentType("application/json")
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "username", username,
                            "password", "replacement-password",
                            "currentPassword", PASSWORD))))
        .andExpect(status().isMethodNotAllowed());
    login(PASSWORD);
    assertThat(
            passwordEncoder.matches(
                PASSWORD, appUserRepository.findById(testUser.getId()).orElseThrow().getPassword()))
        .isTrue();
  }

  @Test
  void passwordChangeRejectsMissingAndIncorrectCurrentPassword() throws Exception {
    String token = login(PASSWORD);
    String path = "/appusers/password";
    var body = new java.util.HashMap<String, String>();
    body.put("newPassword", "replacement-password");

    mockMvc
        .perform(
            put(path)
                .header("Authorization", bearer(token))
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isBadRequest());
    assertThat(
            passwordEncoder.matches(
                PASSWORD, appUserRepository.findById(testUser.getId()).orElseThrow().getPassword()))
        .isTrue();

    body.put("currentPassword", "incorrect-password");
    mockMvc
        .perform(
            put(path)
                .header("Authorization", bearer(token))
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isForbidden());
    assertThat(
            passwordEncoder.matches(
                PASSWORD, appUserRepository.findById(testUser.getId()).orElseThrow().getPassword()))
        .isTrue();
    login(PASSWORD);
  }

  @Test
  void passwordChangeWithCorrectCurrentPasswordChangesPassword() throws Exception {
    String token = login(PASSWORD);
    String replacement = "replacement-password";
    mockMvc
        .perform(
            put("/appusers/password")
                .header("Authorization", bearer(token))
                .contentType("application/json")
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("newPassword", replacement, "currentPassword", PASSWORD))))
        .andExpect(status().isOk());
    login(replacement);
    mockMvc
        .perform(post("/token").with(httpBasic(username, PASSWORD)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void revokedTokenRemainsRevokedWhenServiceIsRecreated() {
    revokedJti = "revoked-it-" + UUID.randomUUID();
    tokenBlacklistService.blacklistToken(revokedJti, Instant.now().plusSeconds(3600));

    TokenBlacklistService recreatedService = new TokenBlacklistService(revokedTokenRepository);

    assertThat(recreatedService.isTokenBlacklisted(revokedJti)).isTrue();
  }
}
