package fi.fisma.backend.security;

import fi.fisma.backend.security.UserDetailsServiceImpl.AppUserDetails;
import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
// import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenService {
  private final JwtEncoder encoder;

  /**
   * Generates a signed JWT for the given authenticated user
   *
   * <p>The token contains the following claims: issuer: {@code "self"} issuedAt: the current
   * timestamp expiresAt: 30 days after issuance when remember-me is enabled, otherwise 24 hours
   * after issuance subject: the authenticated user’s username scope: space-separated list of
   * authorities granted to the user
   *
   * @param authentication the Spring Security Authentication object representing the authenticated
   *     user
   * @param rememberMe whether the token should remain valid for 30 days instead of 24 hours
   * @return the encoded JWT as a String
   * @throws IllegalArgumentException if encoding the claims fails
   */
  public String generateToken(Authentication authentication, boolean rememberMe) {
    Instant now = Instant.now();
    long expiry = rememberMe ? 2592000L : 86400L; // 30 days : 1 day
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
            .issuedAt(now)
            .expiresAt(now.plusSeconds(expiry))
            .subject(authentication.getName())
            .claim("scope", scope)
            .id(jti);

    // Add user ID to claims if available
    if (userId != null) {
      claimsBuilder.claim("userId", userId);
    }

    JwtClaimsSet claims = claimsBuilder.build();
    // @formatter:on
    return this.encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
  }
}
