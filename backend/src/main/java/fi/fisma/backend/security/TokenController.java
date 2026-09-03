package fi.fisma.backend.security;

import fi.fisma.backend.dto.TokenResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Token Generation", description = "Endpoint for generating token")
public class TokenController {
  private final TokenService tokenService;

  @PostMapping("/token")
  @Operation(
      summary = "Generate a JWT",
      description = "Generates a signed JWT for an authenticated user",
      responses = {
        @ApiResponse(responseCode = "200", description = "Token generated successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Failed to encode the token")
      })
  public ResponseEntity<?> getToken(Authentication authentication) {
    String token = tokenService.generateToken(authentication);
    return ResponseEntity.ok()
        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
        .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Authorization")
        .body(new TokenResponse(token, "Bearer", 86400L));
  }
}
