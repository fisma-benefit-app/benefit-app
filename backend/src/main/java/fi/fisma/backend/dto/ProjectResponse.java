package fi.fisma.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.Data;

@Data
@Schema(description = "Response object containing project details")
public class ProjectResponse {
  @Schema(description = "Unique identifier of the project", example = "1")
  private Long id;

  @Schema(description = "Name of the project", example = "User Authentication Service")
  private String projectName;

  @Schema(description = "Version of the project", example = "1")
  private int version;

  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  @Schema(description = "Creation timestamp", example = "2025-09-25T10:30:00")
  private LocalDateTime createdDate;

  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  @Schema(description = "Last version update timestamp", example = "2025-09-25T15:45:00")
  private LocalDateTime versionDate;

  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  @Schema(description = "Last modification timestamp", example = "2025-09-25T15:45:00")
  private LocalDateTime editedDate;

  @Schema(description = "Total function points of the project", example = "150.5")
  private double totalPoints;

  @Schema(description = "Functional components in the project")
  Set<FunctionalComponentResponse> functionalComponents = new HashSet<>();

  @Schema(description = "Users with access to the project")
  Set<AppUserSummary> appUsers = new HashSet<>();
}
