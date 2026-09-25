package fi.fisma.backend.security;

import fi.fisma.backend.dto.TokenResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Duration;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Token Generation", description = "Endpoint for generating token")
public class TokenController {
  private final TokenService tokenService;

  @PostMapping("/token")
  @Operation(
      summary = "Generate a JWT",
      description =
          "Generates a signed JWT. With Basic credentials this is a login, and rememberMe picks a"
              + " 30-day instead of a 24-hour token. With a Bearer token this renews the session:"
              + " the new token keeps the current token's lifetime (rememberMe is ignored), the"
              + " current token is revoked, and a login can't be renewed past 30 days.",
      responses = {
        @ApiResponse(responseCode = "200", description = "Token generated successfully"),
        @ApiResponse(
            responseCode = "401",
            description = "User not authenticated, or the session can no longer be renewed"),
        @ApiResponse(responseCode = "500", description = "Failed to encode the token")
      })
  public ResponseEntity<?> getToken(
      Authentication authentication, @RequestParam(defaultValue = "false") boolean rememberMe) {
    Jwt token;
    if (authentication instanceof JwtAuthenticationToken jwtAuthentication) {
      var renewed = tokenService.renewToken(jwtAuthentication.getToken());
      if (renewed.isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", "Session can no longer be renewed"));
      }
      token = renewed.get();
    } else {
      token = tokenService.generateToken(authentication, rememberMe);
    }

    String tokenValue = token.getTokenValue();
    long expiry = Duration.between(token.getIssuedAt(), token.getExpiresAt()).toSeconds();
    return ResponseEntity.ok()
        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenValue)
        .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Authorization")
        .body(new TokenResponse(tokenValue, "Bearer", expiry));
  }
}
