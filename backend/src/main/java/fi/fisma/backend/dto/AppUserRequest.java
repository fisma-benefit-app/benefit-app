package fi.fisma.backend.dto;

import fi.fisma.backend.domain.EnumUserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data // Make request-type DTO mutable
@Schema(description = "Request object for creating app users")
public class AppUserRequest {
  @NotEmpty(message = "Username is required")
  String username;

  @NotEmpty(message = "Password is required")
  @Size(max = 72, message = "Password must not exceed 72 characters")
  @Schema(accessMode = Schema.AccessMode.WRITE_ONLY)
  String password;

  @NotNull(message = "Role is required")
  EnumUserRole role;
}
