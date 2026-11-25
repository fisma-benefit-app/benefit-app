package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    description =
        "Response object containing a calculation report comment tied to a project version")
public record CalculationReportCommentResponse(
    @Schema(description = "Unique identifier of the comment", example = "1") Long id,
    @Schema(description = "Comment text", example = "The totals were reviewed with the customer")
        String text,
    @Schema(description = "ID of the project version this comment belongs to", example = "7")
        Long projectId) {}
