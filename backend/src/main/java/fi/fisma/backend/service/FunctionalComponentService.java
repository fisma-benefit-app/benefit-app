package fi.fisma.backend.service;

import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.mapper.FunctionalComponentMapper;
import fi.fisma.backend.mapper.ProjectMapper;
import fi.fisma.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FunctionalComponentService {

  private final ProjectRepository projectRepository;
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
    project.getFunctionalComponents().add(functionalComponentMapper.toEntity(request, project));

    // Normalize order positions to ensure sequential ordering
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

    // Remove component and normalize order
    project.getFunctionalComponents().removeIf(fc -> fc.getId().equals(componentId));
    normalizeComponentOrder(project);

    // Save and return updated project
    Project updatedProject = projectRepository.save(project);
    return projectMapper.toResponse(updatedProject);
  }

  /**
   * Normalizes the order positions of components in a project. Ensures components are numbered
   * sequentially from 0 to (n-1).
   *
   * @param project Project containing the components to normalize
   */
  private void normalizeComponentOrder(Project project) {
    var components = project.getFunctionalComponents();
    int i = 0;
    for (var component : components) {
      component.setOrderPosition(i++);
    }
  }
}
