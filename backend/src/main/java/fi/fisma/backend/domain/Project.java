package fi.fisma.backend.domain;

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
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.MappedCollection;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table("project")
public class Project {
  @Id private Long id;

  @NotBlank(message = "Project name is required")
  @Size(max = 255, message = "Project name must not exceed 255 characters")
  @Column("project_name")
  private String projectName;

  @NotNull(message = "Version is required")
  @PositiveOrZero
  @Column("version")
  private int version;

  @NotNull(message = "Creation date is required")
  @Column("created_date")
  private LocalDateTime createdDate;

  @NotNull(message = "Version date is required")
  @Column("version_date")
  private LocalDateTime versionDate;

  @Column("edited_date")
  private LocalDateTime editedDate;

  @NotNull(message = "Total points are required")
  @PositiveOrZero(message = "Total points cannot be negative")
  @Column("total_points")
  private double totalPoints = 0.0;

  @MappedCollection(idColumn = "project_id")
  private Set<FunctionalComponent> functionalComponents = new HashSet<>();

  @MappedCollection(idColumn = "project_id")
  private Set<ProjectAppUser> appUsers = new HashSet<>();
}
