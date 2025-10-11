package fi.fisma.backend.mapper;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.FunctionalComponentResponse;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.repository.FunctionalComponentRepository;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class FunctionalComponentMapper {
  private final FunctionalComponentRepository functionalComponentRepository;

  public FunctionalComponentMapper(FunctionalComponentRepository functionalComponentRepository) {
    this.functionalComponentRepository = functionalComponentRepository;
  }

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
              if (fc.getId() != null) {
                return updateExistingComponent(fc);
              }
              return createNewComponent(fc, project);
            })
        .collect(Collectors.toSet());
  }

  private FunctionalComponent updateExistingComponent(FunctionalComponentRequest fc) {
    return functionalComponentRepository
        .findByIdActive(fc.getId())
        .map(
            existing -> {
              updateComponentFields(existing, fc);
              return existing;
            })
        .orElseThrow(() -> new EntityNotFoundException("Component not found: " + fc.getId()));
  }

  private FunctionalComponent createNewComponent(FunctionalComponentRequest fc, Project project) {
    var component = toEntity(fc, project);
    return component;
  }

  private void updateComponentFields(FunctionalComponent existing, FunctionalComponentRequest fc) {
    existing.setTitle(fc.getTitle());
    existing.setDescription(fc.getDescription());
    existing.setClassName(fc.getClassName());
    existing.setComponentType(fc.getComponentType());
    existing.setDataElements(fc.getDataElements());
    existing.setReadingReferences(fc.getReadingReferences());
    existing.setWritingReferences(fc.getWritingReferences());
    existing.setFunctionalMultiplier(fc.getFunctionalMultiplier());
    existing.setOperations(fc.getOperations());
    existing.setDegreeOfCompletion(fc.getDegreeOfCompletion());
    existing.setPreviousFCId(fc.getPreviousFCId());
    existing.setOrderPosition(fc.getOrderPosition());
  }
}
