package fi.fisma.backend.dto;

import fi.fisma.backend.security.NewPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data // Make request-type DTO mutable
@Schema(description = "Request object containing details on password change")
public class PasswordChangeRequest {
  @NotBlank(message = "Current password cannot be blank")
  @Size(max = 72, message = "Current password is too long")
  private String currentPassword;

  @NewPassword private String newPassword;
}
