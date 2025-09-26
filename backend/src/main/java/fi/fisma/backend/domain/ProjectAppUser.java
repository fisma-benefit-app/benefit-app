package fi.fisma.backend.domain;

import jakarta.validation.constraints.NotNull;
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
@Table("project_app_user")
public class ProjectAppUser {

  @Id private Long id;

  @NotNull(message = "User ID is required")
  @Column("app_user_id")
  private Long appUserId;

  @NotNull(message = "Project ID is required")
  @Column("project_id")
  private Long projectId;

  public ProjectAppUser(Long appUserId) {
    this.appUserId = appUserId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof ProjectAppUser)) return false;
    ProjectAppUser other = (ProjectAppUser) o;
    return id != null && id.equals(other.getId());
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
