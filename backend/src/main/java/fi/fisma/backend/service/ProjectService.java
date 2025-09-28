package fi.fisma.backend.service;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.domain.ProjectAppUser;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final AppUserRepository appUserRepository;

  public Project getProject(Long projectId, String username) {
    var project =
        projectRepository
            .findByProjectIdAndUsername(projectId, username)
            .orElseThrow(
                () -> new EntityNotFoundException("Project not found with id: " + projectId));

    return project;
  }

  public List<Project> getAllProjects(String username) {
    return projectRepository.findAllByUsername(username);
  }

  public Project updateProject(Long projectId, Project projectUpdate, String username) {
    var existingProject =
        projectRepository
            .findByProjectIdAndUsername(projectId, username)
            .orElseThrow(
                () -> new EntityNotFoundException("Project not found with id: " + projectId));

    var updatedProject =
        new Project(
            existingProject.getId(),
            projectUpdate.getProjectName(),
            projectUpdate.getVersion(),
            projectUpdate.getCreatedDate(),
            projectUpdate.getVersionDate(),
            projectUpdate.getEditedDate(),
            projectUpdate.getTotalPoints(),
            projectUpdate.getFunctionalComponents(),
            projectUpdate.getAppUsers());

    return projectRepository.save(updatedProject);
  }

  public Optional<Project> createProject(Project newProjectRequest, String username) {
    var appUser = appUserRepository.findByUsername(username);
    if (appUser == null) return Optional.empty();

    var savedProject =
        projectRepository.save(
            new Project(
                null,
                newProjectRequest.getProjectName(),
                newProjectRequest.getVersion(),
                newProjectRequest.getCreatedDate(),
                newProjectRequest.getVersionDate(),
                newProjectRequest.getEditedDate(),
                newProjectRequest.getTotalPoints(),
                newProjectRequest.getFunctionalComponents(),
                Set.of(new ProjectAppUser(appUser.getId()))));

    return Optional.of(savedProject);
  }

  public Optional<Project> createProjectVersion(Project newProjectVersion, String username) {
    var appUser = appUserRepository.findByUsername(username);
    if (appUser == null) return Optional.empty();

    var savedNewVersionProject =
        projectRepository.save(
            new Project(
                null,
                newProjectVersion.getProjectName(),
                newProjectVersion.getVersion(),
                newProjectVersion.getCreatedDate(),
                newProjectVersion.getVersionDate(),
                newProjectVersion.getEditedDate(),
                newProjectVersion.getTotalPoints(),
                Set.of(),
                newProjectVersion.getAppUsers()));

    var functionalComponentsForNewVersion =
        newProjectVersion.getFunctionalComponents().stream()
            .map(
                fc ->
                    new FunctionalComponent(
                        null,
                        fc.getClassName(),
                        fc.getComponentType(),
                        fc.getDataElements(),
                        fc.getReadingReferences(),
                        fc.getWritingReferences(),
                        fc.getFunctionalMultiplier(),
                        fc.getOperations(),
                        fc.getDegreeOfCompletion(),
                        fc.getTitle(),
                        fc.getDescription(),
                        fc.getId(),
                        fc.getOrderPosition()))
            .collect(Collectors.toSet());

    savedNewVersionProject.setFunctionalComponents(functionalComponentsForNewVersion);
    projectRepository.save(savedNewVersionProject);

    return Optional.of(savedNewVersionProject);
  }

  public void deleteProject(Long projectId, String username) {
    var existingProject =
        projectRepository
            .findByProjectIdAndUsername(projectId, username)
            .orElseThrow(
                () -> new EntityNotFoundException("Project not found with id: " + projectId));

    projectRepository.deleteById(existingProject.getId());
  }
}
