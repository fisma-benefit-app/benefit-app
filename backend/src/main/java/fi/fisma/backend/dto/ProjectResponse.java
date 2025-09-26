package fi.fisma.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.Set;

@Schema(description = "Response object containing project details")
public record ProjectResponse(
    @Schema(description = "Unique identifier of the project", example = "1") Long id,
    @Schema(description = "Name of the project", example = "User Authentication Service")
        String projectName,
    @Schema(description = "Version of the project", example = "1") int version,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        @Schema(description = "Creation timestamp", example = "2025-09-25T10:30:00")
        LocalDateTime createdDate,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        @Schema(description = "Last version update timestamp", example = "2025-09-25T15:45:00")
        LocalDateTime versionDate,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        @Schema(description = "Last modification timestamp", example = "2025-09-25T15:45:00")
        LocalDateTime editedDate,
    @Schema(description = "Total function points of the project", example = "150.5")
        double totalPoints,
    @Schema(description = "Functional components in the project")
        Set<FunctionalComponentResponse> functionalComponents,
    @Schema(description = "Users with access to the project") Set<AppUserSummary> appUsers) {}
