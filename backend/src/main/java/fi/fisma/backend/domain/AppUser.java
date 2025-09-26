package fi.fisma.backend.domain;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table("app_user")
public class AppUser {

  @Id private Long id;

  @NotEmpty(message = "Username is required")
  @Size(max = 50, message = "Username must not exceed 50 characters")
  @Pattern(
      regexp = "^[a-zA-Z0-9._-]+$",
      message = "Username can only contain letters, numbers, dots, underscores and hyphens")
  @Column("username")
  private String username;

  // Why max 64 characters? See OWASP's Authentication Cheat Sheet:
  // https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
  @NotEmpty(message = "Password is required")
  @Size(max = 64, message = "Password must not exceed 64 characters")
  @Column("password")
  private String password;
}
