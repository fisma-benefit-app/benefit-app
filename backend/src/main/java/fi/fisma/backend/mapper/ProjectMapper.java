package fi.fisma.backend.mapper;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

  public ProjectResponse toResponse(Project project) {
    var response = new ProjectResponse();
    response.setId(project.getId());
    response.setName(project.getProjectName());
    response.setVersion(project.getVersion());
    response.setCreatedAt(project.getCreatedDate());
    response.setUpdatedAt(project.getEditedDate());
    return response;
  }

  public Project toEntity(ProjectRequest request) {
    return new Project(
        null,
        request.getName(),
        request.getVersion(),
        LocalDateTime.now(),
        LocalDateTime.now(),
        LocalDateTime.now(),
        0.0, // Initial total points
        Set.of(), // Empty functional components initially
        Set.of() // AppUsers will be set by service
        );
  }

  public void updateEntityFromRequest(Project project, ProjectRequest request) {
    project.setProjectName(request.getName());
    project.setVersion(request.getVersion());
    project.setEditedDate(LocalDateTime.now());
  }

  public Project createNewVersion(Project originalProject, ProjectRequest request) {
    Project newVersion =
        new Project(
            null,
            request.getName(),
            request.getVersion(),
            originalProject.getCreatedDate(),
            LocalDateTime.now(), // new version date
            LocalDateTime.now(), // new edited date
            originalProject.getTotalPoints(),
            copyFunctionalComponents(originalProject.getFunctionalComponents()),
            originalProject.getAppUsers());
    return newVersion;
  }

  private Set<FunctionalComponent> copyFunctionalComponents(Set<FunctionalComponent> components) {
    return components.stream()
        .map(
            fc ->
                new FunctionalComponent(
                    null,
                    fc.getClassName(),
                    fc.getComponentType(),
                    fc.getDataElements(),
                    fc.getReadingReferences(),
                    fc.getWritingReferences(),
                    fc.getFunctionalMultiplier(),
                    fc.getOperations(),
                    fc.getDegreeOfCompletion(),
                    fc.getTitle(),
                    fc.getDescription(),
                    fc.getId(),
                    fc.getOrderPosition()))
        .collect(Collectors.toSet());
  }
}
