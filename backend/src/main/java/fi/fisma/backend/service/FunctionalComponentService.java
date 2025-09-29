package fi.fisma.backend.service;

import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.ProjectResponse;
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

  @Transactional
  public ProjectResponse createFunctionalComponent(
      Long projectId, FunctionalComponentRequest request, String username) {

    var project = projectService.findProjectForUser(projectId, username);

    // Add new component with normalized order
    int newPosition = project.getFunctionalComponents().size();
    request.setOrderPosition(newPosition);
    project.getFunctionalComponents().add(functionalComponentMapper.toEntity(request));

    // Save and return updated project
    Project updatedProject = projectRepository.save(project);
    return projectMapper.toResponse(updatedProject);
  }

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

  private void normalizeComponentOrder(Project project) {
    var components = project.getFunctionalComponents();
    int i = 0;
    for (var component : components) {
      component.setOrderPosition(i++);
    }
  }
}
