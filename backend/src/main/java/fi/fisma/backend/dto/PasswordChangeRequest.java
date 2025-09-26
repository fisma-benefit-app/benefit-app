package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request object containing details on password change")
public class PasswordChangeRequest {
  @NotEmpty(message = "Password cannot be empty")
  @Size(max = 64, message = "Password must not exceed 64 characters")
  private String newPassword;
}
