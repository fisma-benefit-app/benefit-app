package fi.fisma.backend.service;

import fi.fisma.backend.domain.FunctionalComponent;
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
import org.springframework.validation.annotation.Validated;

@Service
@Validated
@RequiredArgsConstructor
@Transactional
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final AppUserRepository appUserRepository;
  private final ProjectMapper projectMapper;

  /**
   * Retrieves a project by its ID for the specified user and maps it to a response DTO.
   *
   * @param projectId the ID of the project to retrieve
   * @param username the username of the user requesting the project
   * @return ProjectResponse
   * @throws EntityNotFoundException if the project is not found or does not belong to the user
   */
  public ProjectResponse getProject(Long projectId, String username) {
    return projectMapper.toResponse(findProjectForUser(projectId, username));
  }

  /**
   * Retrieves all projects associated with the specified user and maps them to response DTOs.
   *
   * @param username the username of the user whose projects should be retrieved
   * @return list of ProjectResponse objects
   */
  public List<ProjectResponse> getAllProjects(String username) {
    return projectRepository.findAllByUsername(username).stream()
        .map(projectMapper::toResponse)
        .collect(Collectors.toList());
  }

  /**
   * Updates an existing project for the specified user with the provided request data.
   *
   * @param projectId the ID of the project to update
   * @param projectUpdate the request object containing the updated project data
   * @param username the username of the user performing the update
   * @return the updated ProjectResponse
   * @throws EntityNotFoundException if the project is not found or does not belong to the user
   */
  public ProjectResponse updateProject(
      Long projectId, ProjectRequest projectUpdate, String username) {
    var project = findProjectForUser(projectId, username);
    var updatedProject = projectMapper.updateEntityFromRequest(project, projectUpdate);
    return projectMapper.toResponse(projectRepository.save(updatedProject));
  }

  /**
   * Creates a new project associated with the specified user.
   *
   * @param newProjectRequest the request object containing the new project’s data
   * @param username the username of the user creating the project
   * @return the created ProjectResponse
   * @throws UnauthorizedException if the user is not found
   */
  public ProjectResponse createProject(ProjectRequest newProjectRequest, String username) {
    var appUser =
        appUserRepository
            .findByUsername(username)
            .orElseThrow(() -> new UnauthorizedException("User not found: " + username));

    var project = projectMapper.toEntity(newProjectRequest);
    project.setProjectAppUsers(Set.of(new ProjectAppUser(project, appUser)));
    return projectMapper.toResponse(projectRepository.save(project));
  }

  /**
   * Creates a new version of an existing project for the specified user.
   *
   * @param projectId the ID of the original project
   * @param versionRequest the request object containing the new version’s data
   * @param username the username of the user creating the new version
   * @return the created ProjectResponse representing the new version
   * @throws EntityNotFoundException if the original project is not found or does not belong to the
   *     user
   * @throws UnauthorizedException if the user is not found
   */
  public ProjectResponse createProjectVersion(
      Long projectId, ProjectRequest versionRequest, String username) {
    var originalProject = findProjectForUser(projectId, username);
    var appUser =
        appUserRepository
            .findByUsername(username)
            .orElseThrow(() -> new UnauthorizedException("User not found: " + username));

    var newVersion = projectMapper.createNewVersion(originalProject, versionRequest);

    var functionalComponents =
        originalProject.getFunctionalComponents().stream()
            .map(
                fc ->
                    new FunctionalComponent(
                        null,
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
                        fc.getPreviousFCId(),
                        fc.getOrderPosition(),
                        newVersion,
                        null))
            .collect(Collectors.toSet());

    // Associate the project with the copied functional components
    newVersion.setFunctionalComponents(functionalComponents);

    // Associate the project with the requesting user
    newVersion.setProjectAppUsers(Set.of(new ProjectAppUser(newVersion, appUser)));

    var savedProject = projectRepository.save(newVersion);

    return projectMapper.toResponse(savedProject);
  }

  /**
   * Deletes a project by its ID for the specified user.
   *
   * @param projectId the ID of the project to delete
   * @param username the username of the user performing the deletion
   * @throws EntityNotFoundException if the project is not found or does not belong to the user
   */
  public void deleteProject(Long projectId, String username) {
    var project = findProjectForUser(projectId, username);
    projectRepository.deleteById(project.getId());
  }

  /**
   * Helper method that finds a project by its ID and verifies that it belongs to the specified
   * user.
   *
   * @param projectId the ID of the project to find
   * @param username the username of the user who owns the project
   * @return Project
   * @throws EntityNotFoundException if the project is not found or does not belong to the user
   */
  public Project findProjectForUser(Long projectId, String username) {
    return projectRepository
        .findByProjectIdAndUsername(projectId, username)
        .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
  }
}
