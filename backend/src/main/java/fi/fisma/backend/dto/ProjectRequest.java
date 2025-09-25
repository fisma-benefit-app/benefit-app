package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Set;
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
  private String projectName;

  @Schema(description = "Version of the project", example = "1")
  private Integer version;

  Set<FunctionalComponentRequest> functionalComponents;

  Set<Long> appUserIds;
}
