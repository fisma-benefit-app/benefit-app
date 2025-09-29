package fi.fisma.backend.domain;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table("project_app_user")
public class ProjectAppUser {

  // Will result in N+1 query problems with large numbers of users in the
  // future, consider adding ManyToOne relationship to AppUser instead
  @NotNull(message = "User ID is required")
  @Column("app_user_id")
  private Long appUserId;

  // Consider adding ManyToOne relationship to Project instead
  @NotNull(message = "Project ID is required")
  @Column("project_id")
  private Long projectId;
}
