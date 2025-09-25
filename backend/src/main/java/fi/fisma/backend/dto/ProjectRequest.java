package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request object for creating or updating a project")
public class ProjectRequest {
  @NotBlank(message = "Project name is required")
  @Size(min = 1, max = 255, message = "Project name must be between 1 and 255 characters")
  @Pattern(
      regexp = "^[\\w\\-\\s]+$",
      message = "Project name can only contain letters, numbers, spaces, and hyphens")
  @Schema(description = "Name of the project", example = "My Project")
  private String name;

  @NotNull(message = "Project type must be specified")
  @Pattern(
      regexp = "^(BACKEND|FRONTEND|FULLSTACK|MOBILE|DESKTOP|OTHER)$",
      message = "Project type must be one of: BACKEND, FRONTEND, FULLSTACK, MOBILE, DESKTOP, OTHER")
  @Schema(description = "Type of the project", example = "BACKEND")
  private String projectType;

  @Size(max = 1000, message = "Description cannot exceed 1000 characters")
  @Schema(
      description = "Optional description of the project",
      example = "A backend service for user management")
  private String description;

  @NotNull(message = "Language must be specified")
  @Pattern(
      regexp = "^(JAVA|PYTHON|JAVASCRIPT|TYPESCRIPT|CSHARP|OTHER)$",
      message = "Language must be one of: JAVA, PYTHON, JAVASCRIPT, TYPESCRIPT, CSHARP, OTHER")
  @Schema(description = "Primary programming language of the project", example = "JAVA")
  private String language;

  @Pattern(
      regexp = "^\\d+\\.\\d+\\.\\d+$",
      message = "Version must be in semantic versioning format (e.g., 1.0.0)")
  @Schema(description = "Version of the project in semantic versioning format", example = "1.0.0")
  private String version;
}
