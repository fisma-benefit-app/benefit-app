package fi.fisma.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "app_users")
public class AppUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotEmpty(message = "Username is required")
  @Size(max = 50, message = "Username must not exceed 50 characters")
  @Column(name = "username")
  private String username;

  // Why max 64 characters? See OWASP's Authentication Cheat Sheet:
  // https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
  @NotEmpty(message = "Password is required")
  @Size(max = 64, message = "Password must not exceed 64 characters")
  @Column(name = "password")
  private String password;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  public AppUser(String username, String password, LocalDateTime deletedAt) {
    this.username = username;
    this.password = password;
    this.deletedAt = deletedAt;
  }
}
