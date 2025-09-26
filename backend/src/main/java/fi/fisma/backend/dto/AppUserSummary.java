package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Summary information about an application user")
public record AppUserSummary(
    @Schema(description = "Unique identifier of the user", example = "1") Long id,
    @Schema(description = "Username of the user", example = "john.doe", maxLength = 50)
        String username) {}
