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
  private String projectName;

  @Schema(description = "Version of the project", example = "1")
  private Integer version;

  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @Schema(description = "Creation timestamp", example = "2025-09-25T10:30:00")
  private LocalDateTime createdDate;

  @Schema(description = "Last version update timestamp", example = "2025-09-25T15:45:00")
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime versionDate;

  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @Schema(description = "Last modification timestamp", example = "2025-09-25T15:45:00")
  private LocalDateTime editedDate;

  @Schema(description = "Total function points of the project", example = "150.5")
  private Double totalPoints;

  Set<FunctionalComponentResponse> functionalComponents;

  Set<AppUserSummary> appUsers;
}
