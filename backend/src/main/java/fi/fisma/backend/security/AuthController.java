package fi.fisma.backend.security;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Endpoint for token revocation")
public class AuthController {

  private final TokenBlacklistService blacklistService;
  private final JwtDecoder jwtDecoder;

  @PostMapping("/logout")
  @Operation(
      summary = "Logout and revoke JWT",
      description =
          "Revokes the current JWT by adding it to the blacklist. "
              + "Clients must send the JWT in the Authorization header as 'Bearer <token>'. "
              + "After logout, the token cannot be used for further requests.",
      responses = {
        @ApiResponse(responseCode = "204", description = "Logout successful, token revoked"),
        @ApiResponse(responseCode = "400", description = "Missing or invalid Authorization header"),
        @ApiResponse(responseCode = "401", description = "Invalid, expired or blacklisted JWT")
      })
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

  @GetMapping("/validateJWT")
  @Operation(
      summary = "Validate JWT",
      description = "Dummy endpoint called by frontend to check JWT validity",
      responses = {
        @ApiResponse(responseCode = "200", description = "Token is valid"),
        @ApiResponse(responseCode = "401", description = "Token is invalid, expired, or revoked")
      })
  public ResponseEntity<Void> validate(Authentication authentication) {
    return ResponseEntity.ok().build();
  }
}
