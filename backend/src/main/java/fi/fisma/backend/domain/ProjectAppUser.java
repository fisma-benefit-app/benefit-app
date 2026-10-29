package fi.fisma.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "projects_app_users")
public class ProjectAppUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Project is required")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id")
  private Project project;

  @NotNull(message = "App user is required")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "app_user_id")
  private AppUser appUser;

  @NotNull(message = "Role is required")
  @Column(name = "role_in_project")
  @Enumerated(EnumType.STRING)
  private EnumProjectRole roleInProject;

  public ProjectAppUser(Project project, AppUser appUser, EnumProjectRole roleInProject) {
    this.project = project;
    this.appUser = appUser;
    this.roleInProject = roleInProject;
  }
}
