package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(
    description = "Request object for creating or updating functional components within a project")
public class FunctionalComponentRequest {
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
