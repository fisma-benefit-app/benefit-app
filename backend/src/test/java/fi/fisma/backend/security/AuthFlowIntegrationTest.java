package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;
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
import fi.fisma.backend.service.AppUserService;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

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
  @Autowired private DataSource dataSource;
  @Autowired private LoginAttemptThrottleService loginAttemptThrottleService;
  @Autowired private TokenBlacklistService tokenBlacklistService;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private JwtDecoder jwtDecoder;

  @MockitoSpyBean private JwtEncoder jwtEncoder;
  @Autowired private TokenService tokenService;
  @Autowired private AppUserService appUserService;
  @Autowired private PlatformTransactionManager transactionManager;

  private String username;
  private String unknownUsername;
  private String revokedJti;
  private AppUser testUser;

  @BeforeEach
  void createTestUser() throws Exception {
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
            + "session_version BIGINT NOT NULL DEFAULT 0, "
            + "deleted_at TIMESTAMP(0))");
    try (var connection = dataSource.getConnection()) {
      ScriptUtils.executeSqlScript(
          connection, new ClassPathResource("migrations/2026_11_14_app_users_session_version.sql"));
    }
    jdbcTemplate.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS app_users_username_lower_key "
            + "ON app_users (LOWER(username))");

    username = "auth-it-" + UUID.randomUUID();
    testUser =
        appUserRepository.save(
            new AppUser(
                null, username, passwordEncoder.encode(PASSWORD), EnumUserRole.USER, null, 0));
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

  private void changePassword(String token, String current, String replacement, int expected)
      throws Exception {
    mockMvc
        .perform(
            put("/appusers/password")
                .header("Authorization", bearer(token))
                .contentType("application/json")
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("currentPassword", current, "newPassword", replacement))))
        .andExpect(status().is(expected));
  }

  private void assertSessionRejected(String token) throws Exception {
    for (String scheme : new String[] {"Bearer", "bearer", "BEARER", "bEaReR"}) {
      for (String path : new String[] {"/auth/validateJWT", "/projects"}) {
        mockMvc
            .perform(get(path).header("Authorization", scheme + " " + token))
            .andExpect(status().isUnauthorized());
      }
      mockMvc
          .perform(post("/token").header("Authorization", scheme + " " + token))
          .andExpect(status().isUnauthorized());
    }
  }

  private String signedToken(Object version, boolean includeVersion) {
    var claims =
        JwtClaimsSet.builder()
            .subject(username)
            .id(UUID.randomUUID().toString())
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600));
    if (includeVersion) claims.claim(AccountSessionValidator.SESSION_VERSION_CLAIM, version);
    return jwtEncoder.encode(JwtEncoderParameters.from(claims.build())).getTokenValue();
  }

  @Test
  void passwordChangeInvalidatesEverySessionAndLegacyTokensDurably() throws Exception {
    String current = login(PASSWORD);
    String otherSession = login(PASSWORD);
    String legacy = signedToken(null, false);
    Jwt decoded = jwtDecoder.decode(current);
    Jwt decodedLegacy = jwtDecoder.decode(legacy);
    mockMvc
        .perform(get("/auth/validateJWT").header("Authorization", bearer(legacy)))
        .andExpect(status().isOk());

    AppUser otherUser =
        appUserRepository.save(
            new AppUser(
                "other-" + UUID.randomUUID(), passwordEncoder.encode(PASSWORD), EnumUserRole.USER));
    try {
      String unaffected =
          tokenFrom(
              mockMvc
                  .perform(post("/token").with(httpBasic(otherUser.getUsername(), PASSWORD)))
                  .andExpect(status().isOk())
                  .andReturn());
      changePassword(current, PASSWORD, "replacement-password", 200);
      assertSessionRejected(current);
      assertSessionRejected(otherSession);
      assertSessionRejected(legacy);
      // Renewal rechecks state even if the request passed authentication before the commit.
      assertThat(tokenService.renewToken(decoded)).isEmpty();
      var recreated = new AccountSessionValidator(appUserRepository);
      assertThat(recreated.validate(decoded).hasErrors()).isTrue();
      assertThat(recreated.validate(decodedLegacy).hasErrors()).isTrue();
      assertThat(appUserRepository.findById(testUser.getId()).orElseThrow().getSessionVersion())
          .isEqualTo(1);
      mockMvc
          .perform(get("/auth/validateJWT").header("Authorization", bearer(unaffected)))
          .andExpect(status().isOk());
      String fresh = login("replacement-password");
      mockMvc
          .perform(get("/auth/validateJWT").header("Authorization", bearer(fresh)))
          .andExpect(status().isOk());
      mockMvc
          .perform(post("/token").with(httpBasic(username, PASSWORD)))
          .andExpect(status().isUnauthorized());
      // A second change (even to the same password) must also advance the version.
      changePassword(fresh, "replacement-password", "replacement-password", 200);
      assertSessionRejected(fresh);
      assertThat(appUserRepository.findById(testUser.getId()).orElseThrow().getSessionVersion())
          .isEqualTo(2);
      login("replacement-password");
    } finally {
      appUserRepository.deleteById(otherUser.getId());
    }
  }

  @Test
  void rejectedPasswordChangePreservesPasswordAndAllSessions() throws Exception {
    String current = login(PASSWORD);
    String other = login(PASSWORD);
    changePassword(current, "incorrect", "replacement-password", 403);
    mockMvc
        .perform(
            put("/appusers/password")
                .header("Authorization", bearer(current))
                .contentType("application/json")
                .content("{\"newPassword\":\"replacement-password\"}"))
        .andExpect(status().isBadRequest());
    for (String token : new String[] {current, other}) {
      mockMvc
          .perform(get("/auth/validateJWT").header("Authorization", bearer(token)))
          .andExpect(status().isOk());
    }
    assertThat(appUserRepository.findById(testUser.getId()).orElseThrow().getSessionVersion())
        .isZero();
    login(PASSWORD);
    mockMvc
        .perform(post("/token").header("Authorization", bearer(other)))
        .andExpect(status().isOk());
  }

  @Test
  void sessionVersionMigrationPreservesExistingAccountsAndIsRepeatable() throws Exception {
    try (var connection = dataSource.getConnection()) {
      connection.setAutoCommit(false);
      try (var statement = connection.createStatement()) {
        // The temporary table shadows the real table only on this connection.
        statement.execute("CREATE TEMP TABLE app_users (id BIGINT, password TEXT) ON COMMIT DROP");
        statement.execute("INSERT INTO app_users VALUES (1, 'unchanged-hash')");
        var migration =
            new ClassPathResource("migrations/2026_11_14_app_users_session_version.sql");
        ScriptUtils.executeSqlScript(connection, migration);
        try (var rows =
            statement.executeQuery(
                "SELECT password, session_version FROM app_users WHERE id = 1")) {
          assertThat(rows.next()).isTrue();
          assertThat(rows.getString(1)).isEqualTo("unchanged-hash");
          assertThat(rows.getLong(2)).isZero();
        }
        statement.execute("UPDATE app_users SET session_version = 2 WHERE id = 1");
        ScriptUtils.executeSqlScript(connection, migration);
        try (var rows =
            statement.executeQuery("SELECT session_version FROM app_users WHERE id = 1")) {
          assertThat(rows.next()).isTrue();
          assertThat(rows.getLong(1)).isEqualTo(2);
        }
      } finally {
        connection.rollback();
      }
    }
  }

  @Test
  void passwordAndSessionVersionRollbackTogether() throws Exception {
    String token = login(PASSWORD);
    var authentication = new JwtAuthenticationToken(jwtDecoder.decode(token), java.util.List.of());
    assertThatThrownBy(
            () ->
                new TransactionTemplate(transactionManager)
                    .executeWithoutResult(
                        tx -> {
                          appUserService.changePassword(
                              PASSWORD, "replacement-password", authentication);
                          throw new IllegalStateException("force rollback");
                        }))
        .isInstanceOf(IllegalStateException.class);
    assertThat(appUserRepository.findById(testUser.getId()).orElseThrow().getSessionVersion())
        .isZero();
    mockMvc
        .perform(get("/auth/validateJWT").header("Authorization", bearer(token)))
        .andExpect(status().isOk());
    login(PASSWORD);
  }

  @Test
  void malformedSessionVersionsAreRejected() throws Exception {
    for (Object value : new Object[] {-1L, 0.5, "0", true}) {
      assertSessionRejected(signedToken(value, true));
    }
  }

  @Test
  void loginRacingPasswordChangeCannotIssueUsableOldCredentialSession() throws Exception {
    assertIssuanceRace(false);
  }

  @Test
  void renewalRacingPasswordChangeCannotReviveSession() throws Exception {
    assertIssuanceRace(true);
  }

  private void assertIssuanceRace(boolean renewal) throws Exception {
    String current = login(PASSWORD);
    AtomicBoolean first = new AtomicBoolean(true);
    try (var worker = Executors.newSingleThreadExecutor()) {
      // Pause after credential/user-version snapshot, immediately before signing.
      doAnswer(
              invocation -> {
                if (first.getAndSet(false)) {
                  worker
                      .submit(
                          () -> {
                            changePassword(current, PASSWORD, "replacement-password", 200);
                            return null;
                          })
                      .get(10, TimeUnit.SECONDS);
                }
                return invocation.callRealMethod();
              })
          .when(jwtEncoder)
          .encode(any(JwtEncoderParameters.class));
      var request = post("/token");
      if (renewal) request.header("Authorization", bearer(current));
      else request.with(httpBasic(username, PASSWORD));
      String raced = tokenFrom(mockMvc.perform(request).andExpect(status().isOk()).andReturn());
      assertSessionRejected(raced);
      login("replacement-password");
    }
  }

  @Test
  void concurrentPasswordChangesCannotBothUseSameSession() throws Exception {
    String token = login(PASSWORD);
    CountDownLatch start = new CountDownLatch(1);
    try (var workers = Executors.newFixedThreadPool(2)) {
      java.util.concurrent.Callable<Integer> change =
          () -> {
            assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
            return mockMvc
                .perform(
                    put("/appusers/password")
                        .header("Authorization", bearer(token))
                        .contentType("application/json")
                        .content(
                            objectMapper.writeValueAsString(
                                Map.of("currentPassword", PASSWORD, "newPassword", PASSWORD))))
                .andReturn()
                .getResponse()
                .getStatus();
          };
      var first = workers.submit(change);
      var second = workers.submit(change);
      start.countDown();
      var statuses =
          java.util.List.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS));
      assertThat(statuses.stream().filter(code -> code == 200).count()).isEqualTo(1);
      assertThat(statuses).allMatch(code -> code == 200 || code == 401 || code == 403);
    }
    assertThat(appUserRepository.findById(testUser.getId()).orElseThrow().getSessionVersion())
        .isEqualTo(1);
    assertSessionRejected(token);
    login(PASSWORD);
  }

  @Test
  void revokedTokenRemainsRevokedWhenServiceIsRecreated() {
    revokedJti = "revoked-it-" + UUID.randomUUID();
    tokenBlacklistService.blacklistToken(revokedJti, Instant.now().plusSeconds(3600));

    TokenBlacklistService recreatedService = new TokenBlacklistService(revokedTokenRepository);

    assertThat(recreatedService.isTokenBlacklisted(revokedJti)).isTrue();
  }
}
