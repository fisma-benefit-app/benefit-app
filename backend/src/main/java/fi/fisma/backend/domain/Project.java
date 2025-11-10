package fi.fisma.backend.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "projects")
public class Project {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "Project name is required")
  @Size(max = 255, message = "Project name must not exceed 255 characters")
  @Column(name = "project_name")
  private String projectName;

  @NotNull(message = "Version is required")
  @PositiveOrZero
  @Column(name = "version")
  private int version;

  @NotNull(message = "Creation date is required")
  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @NotNull(message = "Version date is required")
  @Column(name = "version_created_at")
  private LocalDateTime versionCreatedAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
  private Set<FunctionalComponent> functionalComponents = new HashSet<>();

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<ProjectAppUser> projectAppUsers = new HashSet<>();

  public Project(
      String projectName,
      int version,
      Set<FunctionalComponent> functionalComponents,
      Set<ProjectAppUser> projectAppUsers) {
    this.projectName = projectName;
    this.version = version;
    this.createdAt = LocalDateTime.now();
    this.versionCreatedAt = LocalDateTime.now();
    this.functionalComponents = functionalComponents;
    this.projectAppUsers = projectAppUsers;
  }
}
