package fi.fisma.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordChangeRequest {
  @NotEmpty(message = "Password cannot be empty")
  @Size(max = 64, message = "Password must not exceed 64 characters")
  private String newPassword;
}
