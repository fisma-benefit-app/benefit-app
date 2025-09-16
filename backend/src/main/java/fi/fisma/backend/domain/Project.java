package fi.fisma.backend.domain;

import java.time.LocalDateTime;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.MappedCollection;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {
  @Id private Long id;
  private String projectName;
  private int version;
  private LocalDateTime createdDate;
  private LocalDateTime versionDate;
  private LocalDateTime editedDate;
  private double totalPoints;

  @MappedCollection(idColumn = "project_id")
  private Set<FunctionalComponent> functionalComponents;

  @MappedCollection(idColumn = "project_id")
  private Set<ProjectAppUser> appUsers;
}
