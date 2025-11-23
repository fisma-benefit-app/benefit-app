package fi.fisma.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {

  private final TokenBlacklistService blacklistService;
  private final JwtDecoder jwtDecoder;

  @PostMapping("/logout")
  public ResponseEntity<String> logout(HttpServletRequest request) {
    String authHeader = request.getHeader("Authorization");

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      String token = authHeader.substring(7);

      try {
        Jwt jwt = jwtDecoder.decode(token);
        String jti = jwt.getId();

        if (jti != null) {
          blacklistService.blacklistToken(jti);
          return ResponseEntity.ok("Logged out successfully");
        }
      } catch (Exception e) {
        return ResponseEntity.badRequest().body("Invalid token");
      }
    }

    return ResponseEntity.badRequest().body("No token provided");
  }
}
