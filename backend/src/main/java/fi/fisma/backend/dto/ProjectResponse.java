package fi.fisma.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.Data;

@Data
@Schema(description = "Response object containing project details")
public class ProjectResponse {
  @Schema(description = "Unique identifier of the project", example = "1")
  private Long id;

  @Schema(description = "Name of the project", example = "User Authentication Service")
  private String name;

  @Schema(
      description = "Type of the project",
      example = "BACKEND",
      allowableValues = {"BACKEND", "FRONTEND", "FULLSTACK", "MOBILE", "DESKTOP", "OTHER"})
  private String projectType;

  @Schema(description = "Optional description of the project")
  private String description;

  @Schema(
      description = "Primary programming language",
      example = "JAVA",
      allowableValues = {"JAVA", "PYTHON", "JAVASCRIPT", "TYPESCRIPT", "CSHARP", "OTHER"})
  private String language;

  @Schema(description = "Version of the project", example = "1")
  private int version;

  @Schema(description = "Username of the project owner", example = "john.doe")
  private String owner;

  @Schema(description = "Total function points of the project", example = "150.5")
  private Double totalPoints;

  @Schema(description = "Number of functional components in the project", example = "12")
  private Integer componentCount;

  @Schema(description = "Project completion percentage", example = "75.5")
  private Double completionPercentage;

  @Schema(description = "List of collaborators' usernames")
  private Set<String> collaborators;

  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @Schema(description = "Creation timestamp", example = "2025-09-25T10:30:00")
  private LocalDateTime createdAt;

  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @Schema(description = "Last modification timestamp", example = "2025-09-25T15:45:00")
  private LocalDateTime updatedAt;

  @Schema(description = "Last version update timestamp", example = "2025-09-25T15:45:00")
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime versionUpdatedAt;
}
