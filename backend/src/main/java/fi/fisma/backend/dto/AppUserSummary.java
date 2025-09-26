package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Summary information about an application user")
public class AppUserSummary {
  @Schema(description = "Unique identifier of the user", example = "1")
  private final Long id;

  @Schema(description = "Username of the user", example = "john.doe", maxLength = 50)
  private final String username;
}
