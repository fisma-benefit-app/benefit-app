package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request object for creating or updating a calculation report comment")
public class CalculationReportCommentRequest {
  @NotBlank(message = "Comment text is required")
  @Size(max = 2000, message = "Comment text must not exceed 2000 characters")
  @Schema(description = "Comment text", example = "The totals were reviewed with the customer")
  private String text;
}