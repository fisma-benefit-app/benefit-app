package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;
import lombok.Data;

@Data // Make request-type DTO mutable
@Schema(description = "Request object for creating or updating a project")
public class ProjectRequest {
  @NotBlank(message = "Project name is required")
  @Size(max = 255, message = "Project name must not exceed 255 characters")
  @Schema(
      description = "Name of the project",
      example = "User Authentication System",
      required = true)
  private String projectName;

  @NotNull(message = "Version is required")
  @PositiveOrZero
  @Schema(description = "Version of the project", example = "1")
  private int version;

  @Schema(description = "List of functional components in the project")
  private Set<FunctionalComponentRequest> functionalComponents = new HashSet<>();

  @Schema(description = "List of user IDs with access to the project")
  private Set<Long> appUserIds = new HashSet<>();
}
