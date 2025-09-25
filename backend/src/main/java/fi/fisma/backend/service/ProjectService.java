package fi.fisma.backend.service;

import fi.fisma.backend.domain.Project;
import fi.fisma.backend.domain.ProjectAppUser;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.mapper.ProjectMapper;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final AppUserRepository appUserRepository;
  private final ProjectMapper projectMapper;

  public ProjectResponse getProject(Long projectId, String username) {
    return projectMapper.toResponse(findProjectForUser(projectId, username));
  }

  public List<ProjectResponse> getAllProjects(String username) {
    return projectRepository.findAllByUsername(username).stream()
        .map(projectMapper::toResponse)
        .collect(Collectors.toList());
  }

  public ProjectResponse updateProject(
      Long projectId, ProjectRequest projectUpdate, String username) {
    var project = findProjectForUser(projectId, username);
    projectMapper.updateEntityFromRequest(project, projectUpdate);
    return projectMapper.toResponse(projectRepository.save(project));
  }

  public ProjectResponse createProject(ProjectRequest newProjectRequest, String username) {
    var appUser = appUserRepository.findByUsername(username);
    if (appUser == null) {
      throw new UnauthorizedException("User not found: " + username);
    }

    var project = projectMapper.toEntity(newProjectRequest);
    project.setAppUsers(Set.of(new ProjectAppUser(appUser.getId())));
    return projectMapper.toResponse(projectRepository.save(project));
  }

  public ProjectResponse createProjectVersion(
      Long projectId, ProjectRequest versionRequest, String username) {
    var originalProject = findProjectForUser(projectId, username);
    var appUser = appUserRepository.findByUsername(username);
    if (appUser == null) {
      throw new UnauthorizedException("User not found: " + username);
    }

    var newVersion = projectMapper.createNewVersion(originalProject, versionRequest);
    newVersion.setAppUsers(Set.of(new ProjectAppUser(appUser.getId())));
    return projectMapper.toResponse(projectRepository.save(newVersion));
  }

  public void deleteProject(Long projectId, String username) {
    var project = findProjectForUser(projectId, username);
    projectRepository.deleteById(project.getId());
  }

  private Project findProjectForUser(Long projectId, String username) {
    return projectRepository
        .findByProjectIdAndUsername(projectId, username)
        .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
  }
}
