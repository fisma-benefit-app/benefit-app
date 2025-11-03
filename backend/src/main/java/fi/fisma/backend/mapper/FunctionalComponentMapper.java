package fi.fisma.backend.mapper;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.FunctionalComponentResponse;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.repository.FunctionalComponentRepository;
import java.util.ArrayList;
import java.util.List;
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
        request.getIsMLA(),
        request.getParentFCId(),
        request.getSubComponentType(),
        request.getIsReadonly(),
        null,
        project,
        null);
  }

  public FunctionalComponentResponse toResponse(FunctionalComponent component) {
    // Skip deleted components
    if (component.getDeletedAt() != null) {
      return null;
    }

    List<FunctionalComponentResponse> subComponentResponses = null;
  if (component.getSubComponents() != null && !component.getSubComponents().isEmpty()) {
    subComponentResponses = component.getSubComponents().stream()
        .map(this::toResponse)
        .filter(resp -> resp != null)  // Filter out deleted components
        .collect(Collectors.toList());
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
        component.getOrderPosition(),
        component.getIsMLA(),
        component.getParentFCId(),
        component.getSubComponentType(),
        component.getIsReadonly(),
        subComponentResponses);
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
    return toEntity(fc, project);
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
    existing.setIsMLA(fc.getIsMLA());
    existing.setParentFCId(fc.getParentFCId());
    existing.setSubComponentType(fc.getSubComponentType());
    existing.setIsReadonly(fc.getIsReadonly());
    if (fc.getSubComponents() != null && !fc.getSubComponents().isEmpty()) {
    // Clear existing sub-components
    existing.getSubComponents().clear();
    // Add new sub-components
    for (FunctionalComponentRequest subReq : fc.getSubComponents()) {
      FunctionalComponent subComp = toEntity(subReq, existing.getProject());
      existing.getSubComponents().add(subComp);
    }
  }
  }

  private List<FunctionalComponent> mapSubComponents(List<FunctionalComponentRequest> subComponentRequests) {
    if (subComponentRequests == null || subComponentRequests.isEmpty()) {
      return new ArrayList<>();
    }
    return new ArrayList<>();
  }
}
