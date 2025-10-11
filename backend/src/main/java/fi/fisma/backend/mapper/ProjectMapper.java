package fi.fisma.backend.mapper;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.domain.ProjectAppUser;
import fi.fisma.backend.dto.AppUserSummary;
import fi.fisma.backend.dto.FunctionalComponentResponse;
import fi.fisma.backend.dto.ProjectAppUserResponse;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.repository.AppUserRepository;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

  private final AppUserRepository appUserRepository;

  public ProjectMapper(AppUserRepository appUserRepository) {
    this.appUserRepository = appUserRepository;
  }

  public ProjectResponse toResponse(Project project) {
    var response =
        new ProjectResponse(
            project.getId(),
            project.getProjectName(),
            project.getVersion(),
            project.getTotalPoints(),
            project.getCreatedAt(),
            project.getVersionCreatedAt(),
            project.getUpdatedAt(),
            project.getFunctionalComponents().stream()
                .map(
                    fc ->
                        new FunctionalComponentResponse(
                            fc.getId(),
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
                            fc.getOrderPosition()))
                .collect(Collectors.toSet()),
            project.getProjectAppUsers().stream()
                .map(
                    pau ->
                        new ProjectAppUserResponse(
                            pau.getId(),
                            new AppUserSummary(
                                pau.getAppUser().getId(), pau.getAppUser().getUsername())))
                .collect(Collectors.toSet()));
    return response;
  }

  public Project toEntity(ProjectRequest request) {
    return new Project(
        null,
        request.getProjectName(),
        request.getVersion(),
        0.0, // Initial total points
        LocalDateTime.now(),
        LocalDateTime.now(),
        LocalDateTime.now(),
        null, // No deletion date initially
        Set.of(), // Empty functional components initially
        Set.of() // ProjectAppUsers will be set by service
        );
  }

  public Project updateEntityFromRequest(Project project, ProjectRequest request) {
    Set<FunctionalComponent> functionalComponents =
        request.getFunctionalComponents().stream()
            .map(
                fc ->
                    new FunctionalComponent(
                        fc.getId(),
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
                        project,
                        null // No deletion date initially
                        ))
            .collect(Collectors.toSet());

    Set<ProjectAppUser> projectAppUsers =
        request.getProjectAppUserIds().stream()
            .map(
                id ->
                    new ProjectAppUser(
                        id,
                        project,
                        appUserRepository
                            .findByProjectAppUserId(id)
                            .orElseThrow(
                                () ->
                                    new IllegalArgumentException(
                                        "AppUser not found with projectAppUser id: " + id))))
            .collect(Collectors.toSet());

    Project updatedProject =
        new Project(
            project.getId(),
            request.getProjectName(),
            request.getVersion(),
            project.getTotalPoints(),
            project.getCreatedAt(),
            project.getVersionCreatedAt(),
            LocalDateTime.now(), // new edited date
            project.getDeletedAt(),
            functionalComponents,
            projectAppUsers);
    return updatedProject;
  }

  public Project createNewVersion(Project originalProject, ProjectRequest request) {
    Project newVersion =
        new Project(
            null,
            request.getProjectName(),
            request.getVersion(),
            originalProject.getTotalPoints(),
            originalProject.getCreatedAt(), // keep original creation date
            LocalDateTime.now(), // new version date
            LocalDateTime.now(), // new edited date
            null, // No deletion date initially
            Set.of(), // FunctionalComponents will be set by service
            Set.of() // ProjectAppUsers will be set by service
            );
    return newVersion;
  }
}
