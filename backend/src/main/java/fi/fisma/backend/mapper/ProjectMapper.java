package fi.fisma.backend.mapper;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.domain.ProjectAppUser;
import fi.fisma.backend.dto.AppUserSummary;
import fi.fisma.backend.dto.FunctionalComponentResponse;
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
            project.getCreatedDate(),
            project.getVersionDate(),
            project.getEditedDate(),
            project.getTotalPoints(),
            project.getFunctionalComponents().stream()
                .map(
                    fc ->
                        new FunctionalComponentResponse(
                            fc.getId(),
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
                            fc.getPreviousFCId(),
                            fc.getOrderPosition()))
                .collect(Collectors.toSet()),
            project.getAppUsers().stream()
                .map(
                    pau -> {
                      AppUser user = pau.getAppUser();
                      return new AppUserSummary(user.getId(), user.getUsername());
                    })
                .collect(Collectors.toSet()));
    return response;
  }

  public Project toEntity(ProjectRequest request) {
    return new Project(
        null,
        request.getProjectName(),
        request.getVersion(),
        LocalDateTime.now(),
        LocalDateTime.now(),
        LocalDateTime.now(),
        0.0, // Initial total points
        Set.of(), // Empty functional components initially
        Set.of() // AppUsers will be set by service
        );
  }

  public Project updateEntityFromRequest(Project project, ProjectRequest request) {
    Set<FunctionalComponent> functionalComponents =
        request.getFunctionalComponents().stream()
            .map(
                fc ->
                    new FunctionalComponent(
                        fc.getId(),
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
                        fc.getPreviousFCId(),
                        fc.getOrderPosition(),
                        project))
            .collect(Collectors.toSet());

    Set<ProjectAppUser> appUsers =
        request.getAppUserIds().stream()
            .map(
                userId -> {
                  AppUser user =
                      appUserRepository
                          .findById(userId)
                          .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                  // First try to find existing ProjectAppUser
                  return project.getAppUsers().stream()
                      .filter(pau -> pau.getAppUser().getId().equals(userId))
                      .findFirst()
                      .orElse(new ProjectAppUser(project, user)); // Create new if not found
                })
            .collect(Collectors.toSet());

    Project updatedProject =
        new Project(
            project.getId(),
            request.getProjectName(),
            request.getVersion(),
            project.getCreatedDate(),
            project.getVersionDate(),
            LocalDateTime.now(), // new edited date
            project.getTotalPoints(),
            functionalComponents,
            appUsers);
    return updatedProject;
  }

  public Project createNewVersion(Project originalProject, ProjectRequest request) {
    Project newVersion =
        new Project(
            null,
            request.getProjectName(),
            request.getVersion(),
            originalProject.getCreatedDate(), // keep original creation date
            LocalDateTime.now(), // new version date
            LocalDateTime.now(), // new edited date
            originalProject.getTotalPoints(),
            // copyFunctionalComponents(originalProject.getFunctionalComponents()),
            Set.of(), // FunctionalComponents will be set by service
            Set.of() // AppUsers will be set by service
            );
    return newVersion;
  }
  /*
  private Set<FunctionalComponent> copyFunctionalComponents(Set<FunctionalComponent> components) {
    return components.stream()
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
                    fc.getPreviousFCId(),
                    fc.getOrderPosition(),
                    fc.getProject()))
        .collect(Collectors.toSet());
  }
        */
}
