package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response object containing project-user relationship details")
public record ProjectAppUserResponse(
    @Schema(description = "ID of the project-user relationship", example = "1") Long id,
    @Schema(description = "User details") AppUserSummary user) {}
