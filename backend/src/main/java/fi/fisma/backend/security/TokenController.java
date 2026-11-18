package fi.fisma.backend.security;

import fi.fisma.backend.dto.TokenResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
          "Generates a signed JWT. Login requires Basic credentials and "
              + SecurityConfig.LOGIN_HEADER
              + ": 1. The rememberMe parameter picks a 30-day instead of a 24-hour token."
              + " With a Bearer token this renews the session:"
              + " the new token keeps the current token's lifetime (rememberMe is ignored), the"
              + " current token is revoked, and a login can't be renewed past 30 days.",
      security = {
        @SecurityRequirement(name = "basicAuth"),
        @SecurityRequirement(name = "bearerAuth")
      },
      parameters =
          @Parameter(
              name = SecurityConfig.LOGIN_HEADER,
              in = ParameterIn.HEADER,
              description =
                  "Required with value 1 for Basic login; not required for Bearer renewal",
              schema =
                  @Schema(
                      type = "string",
                      allowableValues = {"1"})),
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "Token generated successfully",
            headers =
                @Header(
                    name = "Authorization",
                    description = "Bearer token, also returned in the response body",
                    schema = @Schema(type = "string")),
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TokenResponse.class))),
        @ApiResponse(
            responseCode = "401",
            description = "User not authenticated, or the session can no longer be renewed",
            content = @Content(mediaType = "application/json", schema = @Schema(type = "object"))),
        @ApiResponse(
            responseCode = "403",
            description = "Missing Basic login header or origin rejected",
            content = @Content),
        @ApiResponse(
            responseCode = "429",
            description = "Too many failed login attempts",
            content = @Content(mediaType = "application/json", schema = @Schema(type = "object"))),
        @ApiResponse(
            responseCode = "500",
            description = "Failed to encode the token",
            content = @Content)
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
