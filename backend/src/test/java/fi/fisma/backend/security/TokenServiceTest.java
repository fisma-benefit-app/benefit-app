package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.security.UserDetailsServiceImpl.AppUserDetails;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

class TokenServiceTest {

  private AppUserRepository appUserRepository;
  private TokenBlacklistService blacklistService;
  private TokenService tokenService;
  private JwtDecoder decoder;

  private final AppUser alice = new AppUser(42L, "alice", "hash", null);

  @BeforeEach
  void setUp() throws Exception {
    var generator = KeyPairGenerator.getInstance("RSA");
    generator.initialize(2048);
    var keyPair = generator.generateKeyPair();
    var publicKey = (RSAPublicKey) keyPair.getPublic();
    var privateKey = (RSAPrivateKey) keyPair.getPrivate();
    var jwk = new RSAKey.Builder(publicKey).privateKey(privateKey).build();

    appUserRepository = mock(AppUserRepository.class);
    blacklistService = mock(TokenBlacklistService.class);
    tokenService =
        new TokenService(
            new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(jwk))),
            appUserRepository,
            blacklistService);
    decoder = NimbusJwtDecoder.withPublicKey(publicKey).build();

    when(appUserRepository.findByUsernameActive("alice")).thenReturn(Optional.of(alice));
  }

  private Jwt login(boolean rememberMe) {
    var userDetails = new AppUserDetails(alice);
    var authentication =
        UsernamePasswordAuthenticationToken.authenticated(
            userDetails, null, userDetails.getAuthorities());
    // Decode to get the token exactly as Spring Security hands it to the controller on renewal.
    return decoder.decode(tokenService.generateToken(authentication, rememberMe).getTokenValue());
  }

  /** A token as it would look if the login happened {@code loginAge} ago. */
  private Jwt tokenFromLogin(Duration loginAge, Duration lifetime) {
    Instant issuedAt = Instant.now().minus(Duration.ofMinutes(1));
    return Jwt.withTokenValue("old-token")
        .header("alg", "RS256")
        .subject("alice")
        .jti("old-jti")
        .issuedAt(issuedAt)
        .expiresAt(issuedAt.plus(lifetime))
        .claim(TokenService.AUTH_TIME_CLAIM, Instant.now().minus(loginAge).getEpochSecond())
        .build();
  }

  private static Duration lifetimeOf(Jwt jwt) {
    return Duration.between(jwt.getIssuedAt(), jwt.getExpiresAt());
  }

  @Test
  void loginTokenHasUserClaimsAndLifetime() {
    Jwt token = login(false);

    assertThat(token.getSubject()).isEqualTo("alice");
    assertThat(token.getClaimAsString("scope")).isEqualTo("ROLE_USER");
    assertThat(((Number) token.getClaim("userId")).longValue()).isEqualTo(42L);
    assertThat(token.getId()).isNotBlank();
    assertThat(lifetimeOf(token)).isEqualTo(Duration.ofDays(1));
    assertThat(token.getClaimAsInstant(TokenService.AUTH_TIME_CLAIM))
        .isEqualTo(token.getIssuedAt());
    assertThat(lifetimeOf(login(true))).isEqualTo(Duration.ofDays(30));
  }

  @Test
  void renewedTokenKeepsLifetimeLoginTimeAndUserClaims() {
    Jwt current = login(false);

    Jwt renewed = decoder.decode(tokenService.renewToken(current).orElseThrow().getTokenValue());

    assertThat(lifetimeOf(renewed)).isEqualTo(Duration.ofDays(1));
    assertThat(renewed.getClaimAsInstant(TokenService.AUTH_TIME_CLAIM))
        .isEqualTo(current.getClaimAsInstant(TokenService.AUTH_TIME_CLAIM));
    assertThat(renewed.getSubject()).isEqualTo("alice");
    assertThat(renewed.getClaimAsString("scope")).isEqualTo("ROLE_USER");
    assertThat(((Number) renewed.getClaim("userId")).longValue()).isEqualTo(42L);
    assertThat(renewed.getId()).isNotEqualTo(current.getId());
  }

  @Test
  void renewalRevokesTheCurrentToken() {
    Jwt current = login(false);

    tokenService.renewToken(current);

    verify(blacklistService).blacklistToken(current.getId(), current.getExpiresAt());
  }

  @Test
  void renewalIsRefusedForDeletedUser() {
    when(appUserRepository.findByUsernameActive("alice")).thenReturn(Optional.empty());

    assertThat(tokenService.renewToken(login(false))).isEmpty();
    verify(blacklistService, never()).blacklistToken(anyString(), any(Instant.class));
  }

  @Test
  void renewalIsRefusedOnceLoginIsOlderThanMaxSessionAge() {
    Jwt current = tokenFromLogin(Duration.ofDays(31), Duration.ofDays(1));

    assertThat(tokenService.renewToken(current)).isEmpty();
    verify(blacklistService, never()).blacklistToken(anyString(), any(Instant.class));
  }

  @Test
  void renewedTokenNeverOutlivesMaxSessionAge() {
    Jwt current = tokenFromLogin(Duration.ofDays(29), Duration.ofDays(30));

    Jwt renewed = tokenService.renewToken(current).orElseThrow();

    Instant sessionEnd =
        current.getClaimAsInstant(TokenService.AUTH_TIME_CLAIM).plus(TokenService.MAX_SESSION_AGE);
    assertThat(renewed.getExpiresAt()).isEqualTo(sessionEnd);
  }

  @Test
  void tokenWithoutAuthTimeUsesIssueTimeAsLoginTime() {
    Instant issuedAt = Instant.now().minus(Duration.ofDays(2));
    Jwt legacy =
        Jwt.withTokenValue("legacy-token")
            .header("alg", "RS256")
            .subject("alice")
            .jti("legacy-jti")
            .issuedAt(issuedAt)
            .expiresAt(issuedAt.plus(Duration.ofDays(30)))
            .build();

    Jwt renewed = tokenService.renewToken(legacy).orElseThrow();

    assertThat(renewed.getClaimAsInstant(TokenService.AUTH_TIME_CLAIM))
        .isCloseTo(issuedAt, within(5, ChronoUnit.SECONDS));
    assertThat(renewed.getExpiresAt())
        .isCloseTo(issuedAt.plus(TokenService.MAX_SESSION_AGE), within(5, ChronoUnit.SECONDS));
  }
}
