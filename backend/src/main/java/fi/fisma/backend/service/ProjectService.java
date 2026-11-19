package fi.fisma.backend.service;

import fi.fisma.backend.domain.EnumProjectRole;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
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
   * @throws EntityNotFoundException if the project is not found or the user is not a member
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
   * @throws EntityNotFoundException if the project is not found or the user is not a member
   * @throws UnauthorizedException if the user is not an owner of the project
   * @throws ConflictException if the project is not the latest version, or has changed since the
   *     request's lockVersion was read
   * @throws IllegalStateException if the request has no lockVersion or changes the version number
   */
  public ProjectResponse updateProject(
      Long projectId, ProjectRequest projectUpdate, String username) {
    var project = lockProjectFamily(projectId, username);
    requireLatestVersion(project, username);
    if (projectUpdate.getLockVersion() == null) {
      throw new IllegalStateException("lockVersion is required when updating a project");
    }
    if (!Objects.equals(projectUpdate.getLockVersion(), project.getLockVersion())) {
      throw new ConflictException(
          ConflictException.STALE_LOCK_VERSION,
          "The project was changed by someone else. Reload it and try again.");
    }
    if (projectUpdate.getVersion() != project.getVersion()) {
      throw new IllegalStateException("The version number of a project cannot be changed");
    }

    // Keep the display name consistent across versions of this project.
    if (!project.getProjectName().equals(projectUpdate.getProjectName())) {
      versionsOf(project, username)
          .forEach(version -> version.setProjectName(projectUpdate.getProjectName()));
    }

    var updatedProject = projectMapper.updateEntityFromRequest(project, projectUpdate);
    // Flush so the response carries the incremented lockVersion.
    projectRepository.flush();
    return projectMapper.toResponse(updatedProject);
  }

  /**
   * Creates a new project associated with the specified user.
   *
   * @param newProjectRequest the request object containing the new project’s data
   * @param username the username of the user creating the project
   * @return the created ProjectResponse
   * @throws UnauthorizedException if the user is not found
   * @throws ConflictException if the user already has access to a project with the requested name
   */
  public ProjectResponse createProject(ProjectRequest newProjectRequest, String username) {
    // Serialize new project name allocation for the same user until the project is committed.
    var appUser =
        appUserRepository
            .findByUsernameActiveForUpdate(username)
            .orElseThrow(() -> new UnauthorizedException("User not found: " + username));

    String requestedName = newProjectRequest.getProjectName().toLowerCase(Locale.ROOT);
    boolean nameTaken =
        projectRepository.findAllByUsernameActive(username).stream()
            .anyMatch(
                existing ->
                    existing.getProjectName().toLowerCase(Locale.ROOT).equals(requestedName));
    if (nameTaken) {
      throw new ConflictException(
          ConflictException.PROJECT_NAME_ALREADY_EXISTS,
          "A project with this name already exists.");
    }

    var project = projectMapper.toEntity(newProjectRequest);

    // Map + attach functional components from request (so they persist with the
    // project)
    var functionalComponents =
        functionalComponentMapper.updateEntityFromRequest(project, newProjectRequest);
    functionalComponents.forEach(fc -> fc.setProject(project)); // owning side
    project.setFunctionalComponents(functionalComponents);

    project.setProjectAppUsers(Set.of(new ProjectAppUser(project, appUser, EnumProjectRole.OWNER)));
    return projectMapper.toResponse(projectRepository.save(project));
  }

  /**
   * Creates a new version of an existing project for the specified user.
   *
   * @param projectId the ID of the original project
   * @param versionRequest the request object containing the new version’s data
   * @param username the username of the user creating the new version
   * @return the created ProjectResponse representing the new version
   * @throws EntityNotFoundException if the original project is not found or the user is not a
   *     member
   * @throws UnauthorizedException if the user is not an owner of the project
   */
  @Transactional
  public ProjectResponse createProjectVersion(
      Long projectId, ProjectRequest versionRequest, String username) {
    var originalProject = lockProjectFamily(projectId, username);
    requireLatestVersion(originalProject, username);
    if (originalProject.getVersion() == Integer.MAX_VALUE) {
      throw new IllegalStateException("The project has reached the maximum version number");
    }

    var newVersion = projectMapper.createNewVersion(originalProject, versionRequest);

    var savedProject = projectRepository.save(newVersion);

    // Create a mapping from old component IDs to new component IDs
    Map<Long, FunctionalComponent> oldToNewComponentMap = new HashMap<>();

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
                          new ArrayList<>(),
                          savedProject,
                          null);
                  var savedComponent = functionalComponentRepository.save(newComponent);
                  oldToNewComponentMap.put(fc.getId(), savedComponent);

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
            var newParent = oldToNewComponentMap.get(originalComponent.getParentFCId());
            if (newParent != null) {
              newComponent.setParentFCId(newParent.getId());
              newParent.getSubComponents().add(newComponent);
              functionalComponentRepository.save(newComponent);
            }
          }
        });

    // Associate the project with the copied functional components
    savedProject.setFunctionalComponents(functionalComponents);

    // The new version keeps everyone’s access and their role from the previous version.
    savedProject.setProjectAppUsers(
        originalProject.getProjectAppUsers().stream()
            .map(
                projectAppUser ->
                    new ProjectAppUser(
                        savedProject,
                        projectAppUser.getAppUser(),
                        Objects.requireNonNullElse(
                            projectAppUser.getRoleInProject(), EnumProjectRole.MEMBER)))
            .collect(Collectors.toSet()));

    return projectMapper.toResponse(savedProject);
  }

  /**
   * Deletes a project by its ID for the specified user.
   *
   * @param projectId the ID of the project to delete
   * @param username the username of the user performing the deletion
   * @throws EntityNotFoundException if the project is not found or the user is not a member
   * @throws UnauthorizedException if the user is not an owner of the project
   * @throws IllegalStateException if project is already deleted
   */
  public void deleteProject(Long projectId, String username) {
    var project = lockProjectFamily(projectId, username);

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
   * Gives another user access to the project and to its other versions, so the new member sees the
   * same version history as the rest. Only an owner can share a project.
   *
   * @param projectId the ID of the project to share
   * @param newMemberUsername the username of the user to add
   * @param username the username of the owner sharing the project
   * @return the ProjectResponse with the updated member list
   * @throws EntityNotFoundException if the project is not found, or no active user has the given
   *     username
   * @throws UnauthorizedException if the caller is not an owner of the project
   * @throws ConflictException if the user is already a member of the project
   */
  public ProjectResponse addUserToProject(
      Long projectId, String newMemberUsername, String username) {
    var project = lockProjectFamily(projectId, username);
    var newMember =
        appUserRepository
            .findByUsernameActive(newMemberUsername)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + newMemberUsername));

    if (isMember(project, newMember.getId())) {
      throw new ConflictException(
          ConflictException.ALREADY_MEMBER, "User is already a member of this project");
    }

    versionsOf(project, username).stream()
        .filter(version -> !isMember(version, newMember.getId()))
        .forEach(
            version ->
                version
                    .getProjectAppUsers()
                    .add(new ProjectAppUser(version, newMember, EnumProjectRole.MEMBER)));
    // The new rows are persisted by the cascade from the managed projects; flush so the response
    // carries their IDs.
    projectRepository.flush();

    return projectMapper.toResponse(project);
  }

  /**
   * Removes a user's access to the project and to its other versions. Only an owner can remove
   * members; the project's data stays for the remaining members.
   *
   * @param projectId the ID of the project
   * @param appUserId the ID of the user to remove
   * @param username the username of the owner removing the user
   * @throws EntityNotFoundException if the project is not found, or the user is not a member
   * @throws UnauthorizedException if the caller is not an owner of the project
   * @throws ConflictException if no other active member would be left, in which case the project
   *     should be deleted instead
   */
  public void removeUserFromProject(Long projectId, Long appUserId, String username) {
    var project = lockProjectFamily(projectId, username);
    if (!isMember(project, appUserId)) {
      throw new EntityNotFoundException("User " + appUserId + " is not a member of this project");
    }

    var affectedVersions =
        versionsOf(project, username).stream()
            .filter(version -> isMember(version, appUserId))
            .toList();
    boolean leavesVersionWithoutAnActiveMember =
        affectedVersions.stream()
            .anyMatch(
                version ->
                    version.getProjectAppUsers().stream()
                        .map(ProjectAppUser::getAppUser)
                        .noneMatch(
                            user ->
                                !user.getId().equals(appUserId) && user.getDeletedAt() == null));
    if (leavesVersionWithoutAnActiveMember) {
      throw new ConflictException(
          ConflictException.LAST_MEMBER,
          "The last member cannot be removed from a project; delete the project instead");
    }

    affectedVersions.forEach(
        version ->
            version
                .getProjectAppUsers()
                .removeIf(pau -> pau.getAppUser().getId().equals(appUserId)));
    // orphanRemoval deletes the removed rows on flush.
    projectRepository.flush();
  }

  private boolean isMember(Project project, Long appUserId) {
    return project.getProjectAppUsers().stream()
        .anyMatch(pau -> pau.getAppUser().getId().equals(appUserId));
  }

  /**
   * Like {@link #findProjectForOwner}, but also requires the project to be the latest version:
   * older versions are archived and must not change, because reports compare a version with the one
   * before it.
   *
   * @throws UnauthorizedException if the user is not an owner of the project
   * @throws ConflictException if a newer version of the project exists
   */
  public Project findEditableProject(Long projectId, String username) {
    var project = findProjectForOwner(projectId, username);
    requireLatestVersion(project, username);
    return project;
  }

  private void requireLatestVersion(Project project, String username) {
    boolean hasNewerVersion =
        versionsOf(project, username).stream().anyMatch(v -> v.getVersion() > project.getVersion());
    if (hasNewerVersion) {
      throw new ConflictException(
          ConflictException.NOT_LATEST_VERSION,
          "Only the latest version of a project can be edited");
    }
  }

  private List<Project> versionsOf(Project project, String username) {
    return projectRepository.findActiveVersions(project.getFamilyId(), username);
  }

  private Project lockProjectFamily(Long projectId, String username) {
    projectRepository
        .lockFamilyForMember(projectId, username)
        .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
    // Membership or ownership could have changed while waiting for the lock.
    return findProjectForOwner(projectId, username);
  }

  /**
   * Helper method that finds a project by its ID and verifies that the specified user is a member.
   *
   * @param projectId the ID of the project to find
   * @param username the username of the user requesting the project
   * @return Project
   * @throws EntityNotFoundException if the project is not found or the user is not a member
   */
  public Project findProjectForUser(Long projectId, String username) {
    return projectRepository
        .findByProjectIdAndUsernameActive(projectId, username)
        .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
  }

  /**
   * Finds a project the user can access and verifies that the user's project role is OWNER.
   *
   * @param projectId the ID of the project to find
   * @param username the username of the user requesting the project
   * @return Project
   * @throws EntityNotFoundException if the project is not found or the user is not a member
   * @throws UnauthorizedException if the user is a member but not an owner
   */
  public Project findProjectForOwner(Long projectId, String username) {
    var project = findProjectForUser(projectId, username);
    boolean isOwner =
        project.getProjectAppUsers().stream()
            .anyMatch(
                projectAppUser ->
                    username.equals(projectAppUser.getAppUser().getUsername())
                        && projectAppUser.getRoleInProject() == EnumProjectRole.OWNER);
    if (!isOwner) {
      throw new UnauthorizedException("Only project owners can modify this project");
    }
    return project;
  }

  /**
   * Picks "<name> - Copy", or "<name> - Copy 2", "<name> - Copy 3", ... for the first one that none
   * of the user's projects has (case-insensitively). The original name is truncated to keep the
   * result within the maximum length.
   */
  private String freeDuplicateName(String originalName, String username) {
    Set<String> takenNames =
        projectRepository.findAllByUsernameActive(username).stream()
            .map(p -> p.getProjectName().toLowerCase(Locale.ROOT))
            .collect(Collectors.toSet());
    for (int copyNumber = 1; ; copyNumber++) {
      String suffix = copyNumber == 1 ? DUPLICATE_SUFFIX : DUPLICATE_SUFFIX + " " + copyNumber;
      int maxOriginalNameLength = MAX_PROJECT_NAME_LENGTH - suffix.length();
      String truncatedName =
          originalName.length() > maxOriginalNameLength
              ? originalName.substring(0, maxOriginalNameLength)
              : originalName;
      String candidate = truncatedName + suffix;
      if (!takenNames.contains(candidate.toLowerCase(Locale.ROOT))) {
        return candidate;
      }
    }
  }

  @Transactional
  public Project duplicateProject(Long id, String username) {
    // Find the initial project in database
    Project originalProject = findProjectForOwner(id, username);

    var appUser =
        appUserRepository
            .findByUsernameActiveForUpdate(username)
            .orElseThrow(() -> new UnauthorizedException("User not found: " + username));

    // Create a new Project
    Project duplicatedProject = new Project();

    // 3. Shallow copy
    duplicatedProject.setProjectName(freeDuplicateName(originalProject.getProjectName(), username));
    duplicatedProject.setReportContactDetails(originalProject.getReportContactDetails());
    duplicatedProject.setReportNotes(originalProject.getReportNotes());
    duplicatedProject.setCalculationDate(originalProject.getCalculationDate());
    duplicatedProject.setVersion(1);
    LocalDateTime now = LocalDateTime.now(clock);
    duplicatedProject.setCreatedAt(now);
    duplicatedProject.setVersionCreatedAt(now);
    duplicatedProject.setUpdatedAt(now);

    // Set AppUser
    duplicatedProject.setProjectAppUsers(
        new HashSet<>(
            Set.of(new ProjectAppUser(duplicatedProject, appUser, EnumProjectRole.OWNER))));
    projectRepository.save(duplicatedProject);

    // 4. Copy active top-level components and their active MLA subcomponents.
    if (originalProject.getFunctionalComponents() != null) {
      Set<FunctionalComponent> duplicatedComponents = new HashSet<>();

      for (FunctionalComponent originalComp : originalProject.getFunctionalComponents()) {
        if (originalComp.getDeletedAt() != null || originalComp.getParentFCId() != null) {
          continue;
        }

        FunctionalComponent newComp =
            functionalComponentRepository.save(
                duplicateComponent(originalComp, duplicatedProject, null));
        duplicatedComponents.add(newComp);

        if (originalComp.getSubComponents() != null) {
          originalComp.getSubComponents().stream()
              .filter(subComponent -> subComponent.getDeletedAt() == null)
              .map(
                  subComponent ->
                      duplicateComponent(subComponent, duplicatedProject, newComp.getId()))
              .map(functionalComponentRepository::save)
              .forEach(newComp.getSubComponents()::add);
        }
      }
      duplicatedProject.setFunctionalComponents(duplicatedComponents);
    }

    // Don't copy comments to the new project

    // 6. Save in Database
    return projectRepository.save(duplicatedProject);
  }

  private FunctionalComponent duplicateComponent(
      FunctionalComponent original, Project project, Long parentId) {
    FunctionalComponent duplicate = new FunctionalComponent();
    duplicate.setTitle(original.getTitle());
    duplicate.setDescription(original.getDescription());
    duplicate.setClassName(original.getClassName());
    duplicate.setComponentType(original.getComponentType());
    duplicate.setDataElements(original.getDataElements());
    duplicate.setReadingReferences(original.getReadingReferences());
    duplicate.setWritingReferences(original.getWritingReferences());
    duplicate.setFunctionalMultiplier(original.getFunctionalMultiplier());
    duplicate.setOperations(original.getOperations());
    duplicate.setDegreeOfCompletion(original.getDegreeOfCompletion());
    duplicate.setPreviousFCId(null);
    duplicate.setOrderPosition(original.getOrderPosition());
    duplicate.setIsMLA(original.getIsMLA());
    duplicate.setParentFCId(parentId);
    duplicate.setSubComponentType(original.getSubComponentType());
    duplicate.setIsReadonly(original.getIsReadonly());
    duplicate.setProject(project);
    duplicate.setDeletedAt(null);
    return duplicate;
  }
}
