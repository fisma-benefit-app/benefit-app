package fi.fisma.backend.project;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.MappedCollection;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
public class Project {
   @Id
   private Long id;
   private String projectName;
   private LocalDateTime createdDate;
   private double totalPoints;
   private Long appUserId;
   @MappedCollection(idColumn = "functional_component_id")
   private Set<FunctionalComponent> functionalComponents;
}
