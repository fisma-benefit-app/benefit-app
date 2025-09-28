package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response object containing JWT token details")
public record TokenResponse(
    @Schema(
            description = "The JWT token issued to the authenticated user",
            example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        String token,
    @Schema(description = "Type of token, usually 'Bearer'", example = "Bearer") String tokenType,
    @Schema(description = "Time in seconds until the token expires", example = "86400")
        long expiresIn) {}
