package fi.fisma.backend.security;

import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

  private final TokenBlacklistService blacklistService;
  private final JwtDecoder jwtDecoder;

  @PostMapping("/logout")
  public void logout(@RequestHeader("Authorization") String authHeader) {
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      String token = authHeader.substring(7);

      try {
        Jwt jwt = jwtDecoder.decode(token);
        String jti = jwt.getId();
        Instant expiresAt = jwt.getExpiresAt();

        if (jti != null && expiresAt != null) {
          blacklistService.blacklistToken(jti, expiresAt);
        }
      } catch (JwtException e) {
      }
    }
  }
}
