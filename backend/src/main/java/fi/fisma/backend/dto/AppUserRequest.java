package fi.fisma.backend.dto;

import fi.fisma.backend.domain.EnumUserRole;
import fi.fisma.backend.security.NewPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data // Make request-type DTO mutable
@Schema(description = "Request object for creating app users")
public class AppUserRequest {
  @NotEmpty(message = "Username is required")
  String username;

  @NewPassword
  @Schema(
      requiredMode = Schema.RequiredMode.REQUIRED,
      accessMode = Schema.AccessMode.WRITE_ONLY,
      description =
          "Nonblank password containing 8 to 72 Unicode code points and at most 72 UTF-8 bytes. Null characters and line breaks are not allowed.")
  String password;

  @NotNull(message = "Role is required")
  EnumUserRole role;
}
