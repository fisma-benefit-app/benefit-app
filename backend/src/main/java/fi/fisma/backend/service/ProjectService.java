package fi.fisma.backend.service;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.domain.ProjectAppUser;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.exception.ConflictException;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.mapper.FunctionalComponentMapper;
import fi.fisma.backend.mapper.ProjectMapper;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.FunctionalComponentRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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

  private static final String DUPLICATE_SUFFIX = " - Copy";
  private static final int MAX_PROJECT_NAME_LENGTH = 255;

  private final ProjectRepository projectRepository;
  private final AppUserRepository appUserRepository;
  private final FunctionalComponentRepository functionalComponentRepository;
  private final FunctionalComponentMapper functionalComponentMapper;
  private final ProjectMapper projectMapper;
  private final Clock clock;

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
   * @throws ConflictException if the project is not the latest version, or has changed since the
   *     request's lockVersion was read
   * @throws IllegalStateException if the request has no lockVersion or changes the version number
   */
  public ProjectResponse updateProject(
      Long projectId, ProjectRequest projectUpdate, String username) {
    var project = findEditableProject(projectId, username);
    if (projectUpdate.getLockVersion() == null) {
      throw new IllegalStateException("lockVersion is required when updating a project");
    }
    if (projectUpdate.getVersion() != project.getVersion()) {
      throw new IllegalStateException("The version number of a project cannot be changed");
    }

    // Versions are grouped by name, so renaming the latest version renames the archived ones too.
    if (!project.getProjectName().equals(projectUpdate.getProjectName())) {
      versionsOf(project, username)
          .forEach(version -> version.setProjectName(projectUpdate.getProjectName()));
    }

    var updatedProject = projectMapper.updateEntityFromRequest(project, projectUpdate);
    // Flush so the response carries the incremented lockVersion.
    return projectMapper.toResponse(projectRepository.saveAndFlush(updatedProject));
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

    // Map + attach functional components from request (so they persist with the
    // project)
    var functionalComponents =
        functionalComponentMapper.updateEntityFromRequest(project, newProjectRequest);
    functionalComponents.forEach(fc -> fc.setProject(project)); // owning side
    project.setFunctionalComponents(functionalComponents);

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
    var originalProject = findEditableProject(projectId, username);
    var appUser =
        appUserRepository
            .findByUsernameActive(username)
            .orElseThrow(() -> new UnauthorizedException("User not found: " + username));

    var newVersion = projectMapper.createNewVersion(originalProject, versionRequest);

    var savedProject = projectRepository.save(newVersion);

    // Create a mapping from old component IDs to new component IDs
    Map<Long, Long> oldToNewIdMap = new HashMap<>();

    // Create copies of functional components
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
                          null, // Temporarily set parent fc to null
                          fc.getSubComponentType(),
                          fc.getIsReadonly(),
                          null, // Subcomponents are intentionally not copied when creating a new
                          // project version.
                          // This is by design: subcomponents are either not used in this context,
                          // or are handled separately.
                          // If subcomponent copying is required in the future, update this logic to
                          // clone subcomponents as well.
                          savedProject,
                          null);
                  var savedComponent = functionalComponentRepository.save(newComponent);
                  oldToNewIdMap.put(fc.getId(), savedComponent.getId());
                  return savedComponent;
                })
            .collect(Collectors.toSet());

    // Update parent references using the mapping
    functionalComponents.forEach(
        newComponent -> {
          // Find the original component to get its parent ID
          var originalComponent =
              originalProject.getFunctionalComponents().stream()
                  .filter(fc -> fc.getId().equals(newComponent.getPreviousFCId()))
                  .findFirst()
                  .orElse(null);

          if (originalComponent != null && originalComponent.getParentFCId() != null) {
            Long newParentId = oldToNewIdMap.get(originalComponent.getParentFCId());
            if (newParentId != null) {
              newComponent.setParentFCId(newParentId);
              functionalComponentRepository.save(newComponent);
            }
          }
        });

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

    LocalDateTime deletionTime = LocalDateTime.now(clock);

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
   * Like {@link #findProjectForUser}, but also requires the project to be the latest version: older
   * versions are archived and must not change, because reports compare a version with the one
   * before it.
   *
   * @throws ConflictException if a newer version of the project exists
   */
  public Project findEditableProject(Long projectId, String username) {
    var project = findProjectForUser(projectId, username);
    boolean hasNewerVersion =
        versionsOf(project, username).stream().anyMatch(v -> v.getVersion() > project.getVersion());
    if (hasNewerVersion) {
      throw new ConflictException(
          ConflictException.NOT_LATEST_VERSION,
          "Only the latest version of a project can be edited");
    }
    return project;
  }

  /** The user's projects that are versions of the given one (same name), the project included. */
  private List<Project> versionsOf(Project project, String username) {
    return projectRepository.findAllByUsernameActive(username).stream()
        .filter(p -> p.getProjectName().equals(project.getProjectName()))
        .toList();
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

  @Transactional
  public Project duplicateProject(Long id, String username) {
    // Find the initial project in database
    Project originalProject = findProjectForUser(id, username);

    var appUser =
        appUserRepository
            .findByUsernameActive(username)
            .orElseThrow(() -> new UnauthorizedException("User not found: " + username));

    // Create a new Project
    Project duplicatedProject = new Project();

    // 3. Shallow copy
    String originalName = originalProject.getProjectName();
    int maxOriginalNameLength = MAX_PROJECT_NAME_LENGTH - DUPLICATE_SUFFIX.length();
    String truncatedName =
        originalName.length() > maxOriginalNameLength
            ? originalName.substring(0, maxOriginalNameLength)
            : originalName;
    duplicatedProject.setProjectName(truncatedName + DUPLICATE_SUFFIX);
    duplicatedProject.setReportContactDetails(originalProject.getReportContactDetails());
    duplicatedProject.setReportNotes(originalProject.getReportNotes());
    duplicatedProject.setCalculationDate(originalProject.getCalculationDate());
    duplicatedProject.setVersion(1);
    LocalDateTime now = LocalDateTime.now(clock);
    duplicatedProject.setCreatedAt(now);
    duplicatedProject.setVersionCreatedAt(now);
    duplicatedProject.setUpdatedAt(now);

    // Set AppUser
    duplicatedProject.setProjectAppUsers(Set.of(new ProjectAppUser(duplicatedProject, appUser)));

    // 4. Copy the list of Functional Components (Deep copy)
    if (originalProject.getFunctionalComponents() != null) {
      Set<FunctionalComponent> duplicatedComponents = new HashSet<>();

      for (FunctionalComponent originalComp : originalProject.getFunctionalComponents()) {
        FunctionalComponent newComp = new FunctionalComponent();

        newComp.setTitle(originalComp.getTitle());
        newComp.setDescription(originalComp.getDescription());
        newComp.setClassName(originalComp.getClassName());
        newComp.setComponentType(originalComp.getComponentType());
        newComp.setOrderPosition(originalComp.getOrderPosition());
        newComp.setIsMLA(originalComp.getIsMLA());
        newComp.setDegreeOfCompletion(originalComp.getDegreeOfCompletion());

        newComp.setProject(duplicatedProject);

        duplicatedComponents.add(newComp);
      }
      duplicatedProject.setFunctionalComponents(duplicatedComponents);
    }

    // Don't copy comments to the new project

    // 6. Save in Database
    return projectRepository.save(duplicatedProject);
  }
}
