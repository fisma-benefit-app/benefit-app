package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(
    description = "Request object for creating or updating functional components within a project")
public class FunctionalComponentRequest {
  @Pattern(
      regexp = "^[A-Z][a-zA-Z0-9]*$",
      message = "Class name must start with uppercase letter and contain only letters and numbers")
  @Size(max = 255, message = "Class name must not exceed 255 characters")
  @Schema(description = "Name of the class", example = "UserAccount", required = true)
  private String className;

  @Schema(description = "Type of the functional component")
  private String componentType;

  @Min(value = 0, message = "Data elements count must be non-negative")
  @Schema(description = "Number of data elements", example = "5", minimum = "0")
  private Integer dataElements;

  @Min(value = 0, message = "Reading references count must be non-negative")
  @Schema(description = "Number of reading references", example = "2", minimum = "0")
  private Integer readingReferences;

  @Min(value = 0, message = "Writing references count must be non-negative")
  @Schema(description = "Number of writing references", example = "1", minimum = "0")
  private Integer writingReferences;

  @Min(value = 1, message = "Functional multiplier must be at least 1")
  @Schema(
      description = "Multiplier for functional points calculation",
      example = "3",
      minimum = "1")
  private Integer functionalMultiplier;

  @Min(value = 0, message = "Operations count must be non-negative")
  @Schema(description = "Number of operations", example = "4", minimum = "0")
  private Integer operations;

  @DecimalMin(value = "0.0", message = "Degree of completion must be between 0 and 1")
  @DecimalMax(value = "1.0", message = "Degree of completion must be between 0 and 1")
  @Schema(
      description = "Completion status (0.0 to 1.0)",
      example = "0.75",
      minimum = "0",
      maximum = "1")
  private Double degreeOfCompletion;

  @Size(max = 255, message = "Title must not exceed 255 characters")
  @Schema(description = "Title of the functional component", example = "Create User Account")
  private String title;

  @Size(max = 1000, message = "Description cannot exceed 1000 characters")
  @Schema(
      description = "Detailed description of the functional component",
      example = "Handles user account creation process")
  private String description;

  @Schema(description = "ID of the previous functional component for ordering", example = "123")
  private Long previousFCId;

  @NotNull(message = "Order position is required")
  @Min(value = 0, message = "Order position must be non-negative")
  @Schema(description = "Position in the component list", example = "1", minimum = "0")
  private Integer orderPosition;
}
