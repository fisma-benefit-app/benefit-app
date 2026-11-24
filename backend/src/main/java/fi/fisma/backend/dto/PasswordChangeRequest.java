package fi.fisma.backend.dto;

import fi.fisma.backend.security.NewPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data // Make request-type DTO mutable
@Schema(description = "Request object containing details on password change")
public class PasswordChangeRequest {
  @Schema(description = "Current account password", accessMode = Schema.AccessMode.WRITE_ONLY)
  @NotBlank(message = "Current password cannot be blank")
  @Size(max = 72, message = "Current password is too long")
  private String currentPassword;

  @NewPassword
  @Schema(
      requiredMode = Schema.RequiredMode.REQUIRED,
      accessMode = Schema.AccessMode.WRITE_ONLY,
      description =
          "Nonblank replacement password containing 8 to 72 Unicode code points and at most 72 UTF-8 bytes. Null characters and line breaks are not allowed.")
  private String newPassword;
}
