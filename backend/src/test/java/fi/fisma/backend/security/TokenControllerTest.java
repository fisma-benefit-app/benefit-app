package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

import fi.fisma.backend.repository.AppUserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest({TokenController.class})
@ActiveProfiles("test")
@Import({
  SecurityConfig.class,
  UserDetailsServiceImpl.class,
  JwtRevocationFilter.class,
  TokenService.class
})
class TokenControllerTest {

  @Autowired MockMvcTester mockMvc;

  @MockitoBean AppUserRepository appUserRepository;
  @MockitoBean TokenService tokenService;
  @MockitoBean TokenBlacklistService blacklistService;
  @MockitoBean LoginAttemptThrottleService loginAttemptThrottleService;

  // A login: the user authenticated with username and password (HTTP Basic).
  private final Authentication loginAuth =
      UsernamePasswordAuthenticationToken.authenticated(
          "test-user", null, AuthorityUtils.createAuthorityList("ROLE_USER"));

  // A renewal: the user authenticated with an existing Bearer token.
  private final JwtRequestPostProcessor jwtAuth =
      org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
          .jwt()
          .jwt(jwt -> jwt.subject("test-user"));

  private static Jwt token(String value, Duration lifetime) {
    Instant now = Instant.now();
    return Jwt.withTokenValue(value)
        .header("alg", "RS256")
        .subject("test-user")
        .issuedAt(now)
        .expiresAt(now.plus(lifetime))
        .build();
  }

  @Test
  void shouldGenerateTokenSuccessfully() {
    given(tokenService.generateToken(any(Authentication.class), eq(false)))
        .willReturn(token("jwt-token-123", Duration.ofDays(1)));

    var response = mockMvc.post().uri("/token").with(authentication(loginAuth)).exchange();

    assertThat(response).hasStatus(HttpStatus.OK);

    // Assert Authorization header
    String authHeader = response.getResponse().getHeader(HttpHeaders.AUTHORIZATION);
    assertThat(authHeader).isEqualTo("Bearer jwt-token-123");

    // Assert CORS header is present
    String exposedHeader =
        response.getResponse().getHeader(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS);
    assertThat(exposedHeader).isEqualTo("Authorization");

    // Assert claims
    assertThat(response).bodyJson().extractingPath("$.token").isEqualTo("jwt-token-123");
    assertThat(response).bodyJson().extractingPath("$.tokenType").isEqualTo("Bearer");
    assertThat(response).bodyJson().extractingPath("$.expiresIn").isEqualTo(86400);
  }

  @Test
  void shouldGenerateRememberMeTokenSuccessfully() {
    given(tokenService.generateToken(any(Authentication.class), eq(true)))
        .willReturn(token("remember-me-jwt-token-123", Duration.ofDays(30)));

    var response =
        mockMvc.post().uri("/token?rememberMe=true").with(authentication(loginAuth)).exchange();

    assertThat(response).hasStatus(HttpStatus.OK);
    assertThat(response)
        .bodyJson()
        .extractingPath("$.token")
        .isEqualTo("remember-me-jwt-token-123");
    assertThat(response).bodyJson().extractingPath("$.expiresIn").isEqualTo(2592000);
  }

  @Test
  void bearerRequestRenewsTokenAndIgnoresRememberMe() {
    given(tokenService.renewToken(any(Jwt.class)))
        .willReturn(Optional.of(token("renewed-jwt-token", Duration.ofDays(1))));

    var response = mockMvc.post().uri("/token?rememberMe=true").with(jwtAuth).exchange();

    assertThat(response).hasStatus(HttpStatus.OK);
    assertThat(response.getResponse().getHeader(HttpHeaders.AUTHORIZATION))
        .isEqualTo("Bearer renewed-jwt-token");
    assertThat(response).bodyJson().extractingPath("$.expiresIn").isEqualTo(86400);
    verify(tokenService, never()).generateToken(any(Authentication.class), anyBoolean());
  }

  @Test
  void bearerRequestIsRejectedWhenRenewalIsRefused() {
    given(tokenService.renewToken(any(Jwt.class))).willReturn(Optional.empty());

    var response = mockMvc.post().uri("/token").with(jwtAuth).exchange();

    assertThat(response).hasStatus(HttpStatus.UNAUTHORIZED);
    assertThat(response.getResponse().getHeader(HttpHeaders.AUTHORIZATION)).isNull();
  }
}
