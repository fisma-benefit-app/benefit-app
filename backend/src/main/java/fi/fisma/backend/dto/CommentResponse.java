package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response object containing a comment tied to a project version")
public record CommentResponse(
    @Schema(description = "Unique identifier of the comment", example = "1") Long id,
    @Schema(description = "Comment text", example = "The validation needs review") String text,
    @Schema(description = "ID of the project version this comment belongs to", example = "7")
        Long projectId) {}
