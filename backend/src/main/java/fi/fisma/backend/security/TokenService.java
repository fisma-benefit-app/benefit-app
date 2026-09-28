package fi.fisma.backend.security;

import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.security.UserDetailsServiceImpl.AppUserDetails;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenService {
  static final Duration SESSION_LIFETIME = Duration.ofDays(1);
  static final Duration REMEMBER_ME_LIFETIME = Duration.ofDays(30);

  /** How long one login can be kept alive through renewals before the user must log in again. */
  static final Duration MAX_SESSION_AGE = Duration.ofDays(30);

  /** Time of the original login, carried over unchanged when a token is renewed. */
  static final String AUTH_TIME_CLAIM = "auth_time";

  private final JwtEncoder encoder;
  private final AppUserRepository appUserRepository;
  private final TokenBlacklistService blacklistService;

  /**
   * Generates a signed JWT for a user who just logged in with their username and password.
   *
   * <p>The token contains the following claims: issuer: {@code "self"} issuedAt: the current
   * timestamp expiresAt: 30 days after issuance when remember-me is enabled, otherwise 24 hours
   * after issuance subject: the authenticated user’s username scope: space-separated list of
   * authorities granted to the user userId: the user's database id auth_time: the login time
   *
   * @param authentication the Spring Security Authentication object representing the authenticated
   *     user
   * @param rememberMe whether the token should remain valid for 30 days instead of 24 hours
   * @return the encoded JWT
   * @throws IllegalArgumentException if encoding the claims fails
   */
  public Jwt generateToken(Authentication authentication, boolean rememberMe) {
    Instant now = Instant.now();
    Duration lifetime = rememberMe ? REMEMBER_ME_LIFETIME : SESSION_LIFETIME;
    return encode(authentication, now, now.plus(lifetime), now);
  }

  /**
   * Replaces a valid token with a new one ("extend session") and revokes the old token.
   *
   * <p>The new token keeps the old token's lifetime and login time, so renewal can't turn a 24-hour
   * token into a 30-day one or keep a login alive for longer than {@link #MAX_SESSION_AGE}. The
   * user is reloaded from the database, so deleted users can't renew.
   *
   * @param current the token presented by the client, already verified by Spring Security
   * @return the new token, or empty if the user no longer exists or the login is too old
   */
  public Optional<Jwt> renewToken(Jwt current) {
    Instant issuedAt = current.getIssuedAt();
    Instant expiresAt = current.getExpiresAt();
    if (issuedAt == null || expiresAt == null) {
      return Optional.empty();
    }

    var user = appUserRepository.findByUsernameActive(current.getSubject());
    if (user.isEmpty()) {
      return Optional.empty();
    }

    // Tokens issued before auth_time existed fall back to their own issue time.
    Instant authTime = current.getClaimAsInstant(AUTH_TIME_CLAIM);
    if (authTime == null) {
      authTime = issuedAt;
    }

    Instant now = Instant.now();
    Instant sessionEnd = authTime.plus(MAX_SESSION_AGE);
    if (!now.isBefore(sessionEnd)) {
      return Optional.empty();
    }

    Instant newExpiresAt = now.plus(Duration.between(issuedAt, expiresAt));
    if (newExpiresAt.isAfter(sessionEnd)) {
      newExpiresAt = sessionEnd;
    }

    var userDetails = new AppUserDetails(user.get());
    var authentication =
        UsernamePasswordAuthenticationToken.authenticated(
            userDetails, null, userDetails.getAuthorities());
    Jwt renewed = encode(authentication, now, newExpiresAt, authTime);

    blacklistService.blacklistToken(current.getId(), expiresAt);
    return Optional.of(renewed);
  }

  private Jwt encode(
      Authentication authentication, Instant issuedAt, Instant expiresAt, Instant authTime) {
    String jti = UUID.randomUUID().toString();
    // @formatter:off
    String scope =
        authentication.getAuthorities().stream()
            .map(authority -> authority.getAuthority())
            .collect(Collectors.joining(" "));

    // Extract user ID from authentication principal
    Long userId = null;
    if (authentication.getPrincipal() instanceof AppUserDetails) {
      AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
      userId = userDetails.getId();
    }

    JwtClaimsSet.Builder claimsBuilder =
        JwtClaimsSet.builder()
            .issuer("self")
            .issuedAt(issuedAt)
            .expiresAt(expiresAt)
            .subject(authentication.getName())
            .claim("scope", scope)
            .claim(AUTH_TIME_CLAIM, authTime.getEpochSecond())
            .id(jti);

    // Add user ID to claims if available
    if (userId != null) {
      claimsBuilder.claim("userId", userId);
    }

    JwtClaimsSet claims = claimsBuilder.build();
    // @formatter:on
    return this.encoder.encode(JwtEncoderParameters.from(claims));
  }
}
