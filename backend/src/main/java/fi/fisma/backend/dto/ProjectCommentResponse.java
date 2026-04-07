package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    description = "Response object containing details on comments within a project")
public record ProjectCommentResponse (
    @Schema(description = "Unique identifier", example = "1") Long id,
    @Schema(description = "Content of the comment") String text
) {}
