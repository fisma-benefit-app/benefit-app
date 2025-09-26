package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(
    description = "Response object containing details on functional components within a project")
public class FunctionalComponentResponse {
  @Schema(description = "Unique identifier", example = "1")
  Long id;

  @Schema(description = "Name of the class", example = "UserAccount")
  String className;

  @Schema(description = "Type of the functional component")
  String componentType;

  @Schema(description = "Number of data elements", example = "5", minimum = "0")
  Integer dataElements;

  @Schema(description = "Number of reading references", example = "2", minimum = "0")
  Integer readingReferences;

  @Schema(description = "Number of writing references", example = "1", minimum = "0")
  Integer writingReferences;

  @Schema(
      description = "Multiplier for functional points calculation",
      example = "3",
      minimum = "1")
  Integer functionalMultiplier;

  @Schema(description = "Number of operations", example = "4", minimum = "0")
  Integer operations;

  @Schema(
      description = "Completion status (0.0 to 1.0)",
      example = "0.75",
      minimum = "0",
      maximum = "1")
  Double degreeOfCompletion;

  @Schema(description = "Title of the functional component", example = "Create User Account")
  String title;

  @Schema(description = "Detailed description of the functional component")
  String description;

  @Schema(description = "ID of the previous functional component for ordering", example = "123")
  Long previousFCId;

  @Schema(description = "Position in the component list", example = "1", minimum = "0")
  Integer orderPosition;
}
