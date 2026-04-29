package fi.fisma.backend.service;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.mapper.FunctionalComponentMapper;
import fi.fisma.backend.mapper.ProjectMapper;
import fi.fisma.backend.repository.FunctionalComponentRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
@RequiredArgsConstructor
public class FunctionalComponentService {

  private final ProjectRepository projectRepository;
  private final FunctionalComponentRepository functionalComponentRepository;
  private final FunctionalComponentMapper functionalComponentMapper;
  private final ProjectMapper projectMapper;
  private final ProjectService projectService;

  /**
   * Creates a new functional component in a project. The component is added at the end of the list
   * and order positions are normalized.
   *
   * @param projectId ID of the project to add the component to
   * @param request Request containing the component details
   * @param username Username of the authenticated user
   * @return Updated project response with the new component
   * @throws UnauthorizedException if user doesn't have access to the project
   * @throws EntityNotFoundException if project not found
   */
  @Transactional
  public ProjectResponse createFunctionalComponent(
      Long projectId, FunctionalComponentRequest request, String username) {

    var project = projectService.findProjectForUser(projectId, username);

    // Add new component at the end
    request.setOrderPosition(project.getFunctionalComponents().size());
    var newComponent = functionalComponentMapper.toEntity(request, project);
    functionalComponentRepository.save(newComponent);

    project.getFunctionalComponents().add(newComponent);
    normalizeComponentOrder(project);

    // Save and return updated project
    Project updatedProject = projectRepository.save(project);
    return projectMapper.toResponse(updatedProject);
  }

  /**
   * Deletes a functional component from a project. After deletion, the remaining components' order
   * positions are normalized.
   *
   * @param componentId ID of the component to delete
   * @param projectId ID of the project containing the component
   * @param username Username of the authenticated user
   * @return Updated project response without the deleted component
   * @throws UnauthorizedException if user doesn't have access to the project
   * @throws EntityNotFoundException if project or component not found
   */
  @Transactional
  public ProjectResponse deleteFunctionalComponent(
      Long componentId, Long projectId, String username) {

    var project = projectService.findProjectForUser(projectId, username);
    var component =
        functionalComponentRepository
            .findByIdActive(componentId)
            .orElseThrow(() -> new EntityNotFoundException("Component not found"));

    // Ensure the component belongs to the specified project
    if (!component.getProject().getId().equals(projectId)) {
      throw new EntityNotFoundException("Component not found in the specified project");
    }

    // Soft delete the component
    LocalDateTime deletionTime = LocalDateTime.now();
    component.setDeletedAt(deletionTime);
    functionalComponentRepository.save(component);

    // Soft deletes the subcomponents
    deleteSubcomponents(component.getId(), deletionTime);

    // Filter out deleted components when normalizing order
    normalizeComponentOrder(project);

    // Save and return updated project
    Project updatedProject = projectRepository.save(project);
    return projectMapper.toResponse(updatedProject);
  }

  @Transactional
  private void deleteSubcomponents(Long parentId, LocalDateTime deletionTime) {
    // Gets a list of a functional component's subcomponents
    List<FunctionalComponent> subcomponents =
        functionalComponentRepository.findByParentFCIdAndDeletedAtIsNull(parentId);

    // Goes through the list and soft delets the subcomponents
    for (FunctionalComponent subcomponent : subcomponents) {
      subcomponent.setDeletedAt(deletionTime);
      functionalComponentRepository.save(subcomponent);

      // Recursively deletes subcomponents of subcomponents, if possible at some point
      deleteSubcomponents(subcomponent.getId(), deletionTime);
    }
  }

  /**
   * Normalizes the order positions of components in a project. Ensures components are numbered
   * sequentially from 0 to (n-1).
   *
   * @param project Project containing the components to normalize
   */
  private void normalizeComponentOrder(Project project) {
    // Only consider non-deleted components when normalizing order
    var activeComponents =
        project.getFunctionalComponents().stream()
            .filter(component -> component.getDeletedAt() == null)
            .sorted(Comparator.comparingInt(FunctionalComponent::getOrderPosition))
            .collect(Collectors.toList());

    // Update positions only for active components
    int i = 0;
    for (var component : activeComponents) {
      component.setOrderPosition(i++);
    }
  }

  @Transactional(readOnly = true)
  public List<FunctionalComponent> getProjectComponents(Long projectId, String username) {
    projectService.findProjectForUser(projectId, username); // Verify access
    return functionalComponentRepository.findAllByProjectIdActive(projectId);
  }
}
