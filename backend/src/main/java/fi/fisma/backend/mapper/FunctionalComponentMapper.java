package fi.fisma.backend.mapper;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.FunctionalComponentResponse;
import fi.fisma.backend.dto.ProjectRequest;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class FunctionalComponentMapper {

  public FunctionalComponent toEntity(FunctionalComponentRequest request, Project project) {
    return new FunctionalComponent(
        null,
        request.getTitle(),
        request.getDescription(),
        request.getClassName(),
        request.getComponentType(),
        request.getDataElements(),
        request.getReadingReferences(),
        request.getWritingReferences(),
        request.getFunctionalMultiplier(),
        request.getOperations(),
        request.getDegreeOfCompletion(),
        request.getPreviousFCId(),
        request.getOrderPosition(),
        project,
        null);
  }

  public FunctionalComponentResponse toResponse(FunctionalComponent component) {
    // Skip deleted components
    if (component.getDeletedAt() != null) {
      return null;
    }

    return new FunctionalComponentResponse(
        component.getId(),
        component.getTitle(),
        component.getDescription(),
        component.getClassName(),
        component.getComponentType(),
        component.getDataElements(),
        component.getReadingReferences(),
        component.getWritingReferences(),
        component.getFunctionalMultiplier(),
        component.getOperations(),
        component.getDegreeOfCompletion(),
        component.getPreviousFCId(),
        component.getOrderPosition());
  }

  public Set<FunctionalComponent> updateEntityFromRequest(Project project, ProjectRequest request) {
    return request.getFunctionalComponents().stream()
        .map(
            fc -> {
              // For versioning, always create new component with link to previous component
              var newComponent =
                  new FunctionalComponent(
                      null, // New ID for version
                      fc.getTitle(),
                      fc.getDescription(),
                      fc.getClassName(),
                      fc.getComponentType(),
                      fc.getDataElements(),
                      fc.getReadingReferences(),
                      fc.getWritingReferences(),
                      fc.getFunctionalMultiplier(),
                      fc.getOperations(),
                      fc.getDegreeOfCompletion(),
                      fc.getId(), // Link to previous component
                      fc.getOrderPosition(),
                      project,
                      null // Not deleted
                      );

              return newComponent;
            })
        .collect(Collectors.toSet());
  }
}
