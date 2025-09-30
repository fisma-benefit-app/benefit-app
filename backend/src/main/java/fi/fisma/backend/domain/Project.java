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
@Table(name = "project")
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
  @Column(name = "created_date")
  private LocalDateTime createdDate;

  @NotNull(message = "Version date is required")
  @Column(name = "version_date")
  private LocalDateTime versionDate;

  @Column(name = "edited_date")
  private LocalDateTime editedDate;

  @NotNull(message = "Total points are required")
  @PositiveOrZero(message = "Total points cannot be negative")
  @Column(name = "total_points")
  private double totalPoints = 0.0;

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<FunctionalComponent> functionalComponents = new HashSet<>();

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<ProjectAppUser> appUsers = new HashSet<>();

  public Project(
      String projectName,
      int version,
      Set<FunctionalComponent> functionalComponents,
      Set<ProjectAppUser> appUsers) {
    this.projectName = projectName;
    this.version = version;
    this.createdDate = LocalDateTime.now();
    this.versionDate = LocalDateTime.now();
    this.functionalComponents = functionalComponents;
    this.appUsers = appUsers;
  }
}
