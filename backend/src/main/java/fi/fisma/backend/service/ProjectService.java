package fi.fisma.backend.service;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.domain.ProjectAppUser;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.exception.IllegalStateException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.mapper.ProjectMapper;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.FunctionalComponentRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.time.LocalDateTime;
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
  private final FunctionalComponentRepository functionalComponentRepository;
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
    return projectRepository.findAllByUsernameActive(username).stream()
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
            .findByUsernameActive(username)
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
  @Transactional
  public ProjectResponse createProjectVersion(
      Long projectId, ProjectRequest versionRequest, String username) {
    var originalProject = findProjectForUser(projectId, username);
    var appUser =
        appUserRepository
            .findByUsernameActive(username)
            .orElseThrow(() -> new UnauthorizedException("User not found: " + username));

    var newVersion = projectMapper.createNewVersion(originalProject, versionRequest);

    var savedProject = projectRepository.save(newVersion);

    var functionalComponents =
        originalProject.getFunctionalComponents().stream()
            .filter(fc -> fc.getDeletedAt() == null) // Only copy active components
            .map(
                fc -> {
                  var newComponent =
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
                          fc.getId(), // Set previous component's ID
                          fc.getOrderPosition(),
                          fc.getIsMLA(),
                          fc.getParentFCId(), // TODO: Must be updated if parent is also copied
                          fc.getSubComponentType(),
                          fc.getIsReadonly(),
                          null, // fc.getSubComponents() fails - not needed anyway
                          savedProject,
                          null);
                  return functionalComponentRepository.save(newComponent);
                })
            .collect(Collectors.toSet());

    // Associate the project with the copied functional components
    savedProject.setFunctionalComponents(functionalComponents);

    // Associate the project with the requesting user
    savedProject.setProjectAppUsers(Set.of(new ProjectAppUser(savedProject, appUser)));

    return projectMapper.toResponse(savedProject);
  }

  /**
   * Deletes a project by its ID for the specified user.
   *
   * @param projectId the ID of the project to delete
   * @param username the username of the user performing the deletion
   * @throws EntityNotFoundException if the project is not found or does not belong to the user
   * @throws IllegalStateException if project is already deleted
   */
  public void deleteProject(Long projectId, String username) {
    var project = findProjectForUser(projectId, username);

    // Check if already deleted
    if (project.getDeletedAt() != null) {
      throw new IllegalStateException("Project is already deleted");
    }

    LocalDateTime deletionTime = LocalDateTime.now();

    // Soft delete components
    project
        .getFunctionalComponents()
        .forEach(
            component -> {
              component.setDeletedAt(deletionTime);
              functionalComponentRepository.save(component);
            });

    // Soft delete the project
    project.setDeletedAt(deletionTime);
    projectRepository.save(project);
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
        .findByProjectIdAndUsernameActive(projectId, username)
        .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
  }
}
