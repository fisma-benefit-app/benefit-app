package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request object for adding a user to a project")
public class ProjectMemberRequest {
  @NotBlank(message = "Username is required")
  @Size(max = 50, message = "Username must not exceed 50 characters")
  @Schema(description = "Username of the user to add", example = "john.doe", maxLength = 50)
  private String username;
}
