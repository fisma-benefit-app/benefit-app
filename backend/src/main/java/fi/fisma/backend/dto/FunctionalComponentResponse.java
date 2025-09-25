package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(
    description = "Response object containing details on functional components within a project")
public class FunctionalComponentResponse {
  Long id;
  String className;
  String componentType;
  Integer dataElements;
  Integer readingReferences;
  Integer writingReferences;
  Integer functionalMultiplier;
  Integer operations;
  Double degreeOfCompletion;
  String title;
  String description;
  Long previousFCId;
  Integer orderPosition;
}
