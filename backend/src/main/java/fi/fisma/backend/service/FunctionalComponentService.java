package fi.fisma.backend.service;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.mapper.FunctionalComponentMapper;
import fi.fisma.backend.mapper.ProjectMapper;
import fi.fisma.backend.repository.FunctionalComponentRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FunctionalComponentService {

  private final ProjectRepository projectRepository;
  private final FunctionalComponentRepository functionalComponentRepository;
  private final FunctionalComponentMapper functionalComponentMapper;
  private final ProjectMapper projectMapper;
  private final ProjectService projectService;

  @Transactional
  public ProjectResponse createFunctionalComponent(
      Long projectId, FunctionalComponentRequest request, String username) {

    var project = projectService.findProjectForUser(projectId, username);

    // Add new component at the end
    request.setOrderPosition(project.getFunctionalComponents().size());
    var newComponent = functionalComponentMapper.toEntity(request, project);

    project.getFunctionalComponents().add(newComponent);
    normalizeComponentOrder(project);

    // Save and return updated project
    Project updatedProject = projectRepository.save(project);
    return projectMapper.toResponse(updatedProject);
  }

  @Transactional
  public ProjectResponse deleteFunctionalComponent(
      Long componentId, Long projectId, String username) {

    var project = projectService.findProjectForUser(projectId, username);
    var component =
        functionalComponentRepository
            .findByIdActive(componentId)
            .orElseThrow(() -> new EntityNotFoundException("Component not found"));

    // Soft delete the component
    LocalDateTime deletionTime = LocalDateTime.now();
    component.setDeletedAt(deletionTime);
    functionalComponentRepository.save(component);

    // Remove from project's active components and normalize order
    project.getFunctionalComponents().removeIf(fc -> fc.getId().equals(componentId));
    normalizeComponentOrder(project);

    // Save and return updated project
    Project updatedProject = projectRepository.save(project);
    return projectMapper.toResponse(updatedProject);
  }

  private void normalizeComponentOrder(Project project) {
    var components = project.getFunctionalComponents();
    int i = 0;
    for (var component : components) {
      component.setOrderPosition(i++);
    }
  }

  @Transactional(readOnly = true)
  public List<FunctionalComponent> getProjectComponents(Long projectId, String username) {
    projectService.findProjectForUser(projectId, username); // Verify access
    return functionalComponentRepository.findAllByProjectIdActive(projectId);
  }
}
