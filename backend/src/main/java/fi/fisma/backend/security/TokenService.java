package fi.fisma.backend.security;

import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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
   * timestamp expiresAt: 24 hours after issuance subject: the authenticated user’s username scope:
   * space-separated list of authorities granted to the user
   *
   * @param authentication the Spring Security Authentication object representing the authenticated
   *     user
   * @return the encoded JWT as a String
   * @throws IllegalArgumentException if encoding the claims fails
   */
  public String generateToken(Authentication authentication) {
    Instant now = Instant.now();
    long expiry = 86400L; // 24 hours
    String jti = UUID.randomUUID().toString();
    // @formatter:off
    String scope =
        authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(" "));
    JwtClaimsSet claims =
        JwtClaimsSet.builder()
            .issuer("self")
            .issuedAt(now)
            .expiresAt(now.plusSeconds(expiry))
            .subject(authentication.getName())
            .claim("scope", scope)
            .id(jti)
            .build();
    // @formatter:on
    return this.encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
  }
}
