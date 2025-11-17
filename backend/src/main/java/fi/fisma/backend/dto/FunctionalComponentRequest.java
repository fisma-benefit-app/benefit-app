package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Data;

@Data // Make request-type DTO mutable
@Schema(
    description = "Request object for creating or updating functional components within a project")
public class FunctionalComponentRequest {
  @Schema(description = "Unique identifier", example = "1")
  private Long id;

  @Size(max = 255, message = "Title must not exceed 255 characters")
  @Schema(description = "Title of the functional component", example = "Create User Account")
  private String title;

  @Size(max = 1000, message = "Description cannot exceed 1000 characters")
  @Schema(
      description = "Detailed description of the functional component",
      example = "Handles user account creation process")
  private String description;

  @Size(max = 255, message = "Class name must not exceed 255 characters")
  @Schema(description = "Name of the class", example = "UserAccount")
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

  @Schema(description = "ID of the previous functional component for ordering", example = "123")
  private Long previousFCId;

  @NotNull(message = "Order position is required")
  @Min(value = 0, message = "Order position must be non-negative")
  @Schema(description = "Position in the component list", example = "1", minimum = "0")
  private Integer orderPosition;

  @NotNull(message = "Multi-layer architecture (MLA) status must be specified")
  @Schema(
      description =
          "Indicates if the functional component participates in multi-layer architecture (MLA) as either a parent or child component. 'true' means the component is part of MLA hierarchy.",
      example = "true")
  private Boolean isMLA;

  @Schema(
      description = "ID of the parent functional component, if part of multi-layer architecture",
      example = "12")
  private Long parentFCId;

  @Schema(
      description = "List of sub-components if part of multi-layer architecture",
      example = "[...]")
  private List<FunctionalComponentRequest> subComponents;

  @Schema(
      description = "Type of sub-component in multi-layer architecture",
      example = "presentation",
      allowableValues = {"presentation", "businessLogic", "dataAccess", "integration"})
  private String subComponentType;

  @NotNull(message = "Readonly status must be specified")
  @Schema(description = "Indicates if component is readonly", example = "true")
  private Boolean isReadonly = false;
}
