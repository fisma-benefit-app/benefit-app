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
import java.util.Map;
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
    FunctionalComponent component =
        new FunctionalComponent(
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
            new ArrayList<>(), // Initialize empty list for subComponents
            project,
            null);

    // Handle subComponents if present
    if (request.getSubComponents() != null && !request.getSubComponents().isEmpty()) {
      for (FunctionalComponentRequest subReq : request.getSubComponents()) {
        FunctionalComponent subComp =
            new FunctionalComponent(
                subReq.getTitle(),
                subReq.getDescription(),
                subReq.getClassName(),
                subReq.getComponentType(),
                subReq.getDataElements(),
                subReq.getReadingReferences(),
                subReq.getWritingReferences(),
                subReq.getFunctionalMultiplier(),
                subReq.getOperations(),
                subReq.getDegreeOfCompletion(),
                subReq.getPreviousFCId(),
                subReq.getOrderPosition(),
                false, // Sub-components are never MLA themselves
                null, // parentFCId will be set after parent is saved
                subReq.getSubComponentType(),
                true, // Sub-components are readonly
                null, // Sub-components don't have their own sub-components
                project,
                null);
        component.getSubComponents().add(subComp);
      }
    }

    return component;
  }

  public FunctionalComponentResponse toResponse(FunctionalComponent component) {
    // Skip deleted components
    if (component.getDeletedAt() != null) {
      return null;
    }

    List<FunctionalComponentResponse> subComponentResponses = null;
    if (component.getSubComponents() != null && !component.getSubComponents().isEmpty()) {
      subComponentResponses =
          component.getSubComponents().stream()
              .map(this::toResponse)
              .filter(resp -> resp != null) // Filter out deleted components
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
              // Only process parent-level components (not subComponents)
              if (fc.getParentFCId() == null) {
                if (fc.getId() != null) {
                  return updateExistingComponent(project, fc);
                }
                return createNewComponent(fc, project);
              }
              return null; // Skip subComponents as they're handled by their parents
            })
        .filter(component -> component != null)
        .collect(Collectors.toSet());
  }

  private FunctionalComponent updateExistingComponent(
      Project project, FunctionalComponentRequest fc) {
    return functionalComponentRepository
        .findByIdActive(fc.getId(), project.getId())
        .map(
            existing -> {
              updateComponentFields(existing, fc, project);
              return existing;
            })
        .orElseThrow(
            () -> new EntityNotFoundException("Component not found with the id: " + fc.getId()));
  }

  private FunctionalComponent createNewComponent(FunctionalComponentRequest fc, Project project) {
    return toEntity(fc, project);
  }

  private void updateComponentFields(
      FunctionalComponent existing, FunctionalComponentRequest fc, Project project) {
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

    // Handle subComponents
    if (fc.getSubComponents() != null && !fc.getSubComponents().isEmpty()) {
      // Index the currently-attached sub-components by id. We look these up from the
      // already-loaded collection rather than clearing it and re-querying the repository:
      // subComponents has orphanRemoval = true, so removing an entity from the collection
      // schedules a hard delete. Re-querying it afterwards (even within the same transaction)
      // can trigger a Hibernate auto-flush that runs that delete first, making a sub-component
      // that's only being updated look like it "doesn't exist" anymore.
      Map<Long, FunctionalComponent> existingSubsById =
          existing.getSubComponents().stream()
              .filter(sub -> sub.getId() != null)
              .collect(Collectors.toMap(FunctionalComponent::getId, sub -> sub));

      // Process each sub-component from the request
      List<FunctionalComponent> updatedSubComponents = new ArrayList<>();
      for (FunctionalComponentRequest subReq : fc.getSubComponents()) {
        FunctionalComponent subComp;

        if (subReq.getId() != null) {
          // Existing sub-components must belong to the same project and to this exact parent.
          subComp = existingSubsById.get(subReq.getId());

          if (subComp == null) {
            functionalComponentRepository
                .findByIdActive(subReq.getId(), project.getId())
                .orElseThrow(
                    () ->
                        new EntityNotFoundException(
                            "Component not found with the id: " + subReq.getId()));

            throw new EntityNotFoundException(
                "Subcomponent "
                    + subReq.getId()
                    + " is not attached to parent component "
                    + existing.getId());
          }

          updateSubComponentFields(subComp, subReq, existing);
        } else {
          // Create new sub-component
          subComp = createSubComponent(subReq, existing);
        }

        updatedSubComponents.add(subComp);
      }

      // Replace the collection in one step so sub-components that are still referenced by the
      // request are never briefly absent from it; only ones dropped from the request are
      // orphan-removed.
      existing.getSubComponents().clear();
      existing.getSubComponents().addAll(updatedSubComponents);
    } else if (existing.getSubComponents() != null && !existing.getSubComponents().isEmpty()) {
      // If no subComponents in request but parent had some, clear them
      existing.getSubComponents().clear();
    }
  }

  private FunctionalComponent createSubComponent(
      FunctionalComponentRequest subReq, FunctionalComponent parent) {
    FunctionalComponent subComp =
        new FunctionalComponent(
            subReq.getTitle(),
            subReq.getDescription(),
            subReq.getClassName(),
            subReq.getComponentType(),
            subReq.getDataElements(),
            subReq.getReadingReferences(),
            subReq.getWritingReferences(),
            subReq.getFunctionalMultiplier(),
            subReq.getOperations(),
            subReq.getDegreeOfCompletion(),
            subReq.getPreviousFCId(),
            subReq.getOrderPosition(),
            false, // Sub-components are never MLA themselves
            parent.getId(), // Set parent ID
            subReq.getSubComponentType(),
            true, // Sub-components are readonly
            null, // Sub-components don't have their own sub-components
            parent.getProject(),
            null);
    return subComp;
  }

  private void updateSubComponentFields(
      FunctionalComponent subComp, FunctionalComponentRequest subReq, FunctionalComponent parent) {
    subComp.setTitle(subReq.getTitle());
    subComp.setDescription(subReq.getDescription());
    subComp.setClassName(subReq.getClassName());
    subComp.setComponentType(subReq.getComponentType());
    subComp.setDataElements(subReq.getDataElements());
    subComp.setReadingReferences(subReq.getReadingReferences());
    subComp.setWritingReferences(subReq.getWritingReferences());
    subComp.setFunctionalMultiplier(subReq.getFunctionalMultiplier());
    subComp.setOperations(subReq.getOperations());
    subComp.setDegreeOfCompletion(subReq.getDegreeOfCompletion());
    subComp.setPreviousFCId(subReq.getPreviousFCId());
    subComp.setOrderPosition(subReq.getOrderPosition());
    subComp.setParentFCId(parent.getId());
    subComp.setSubComponentType(subReq.getSubComponentType());
    subComp.setIsReadonly(true);
    subComp.setIsMLA(false);
  }
}
