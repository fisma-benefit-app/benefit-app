package fi.fisma.backend.mapper;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.domain.ProjectAppUser;
import fi.fisma.backend.dto.AppUserSummary;
import fi.fisma.backend.dto.ProjectAppUserResponse;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.repository.AppUserRepository;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

  private final AppUserRepository appUserRepository;
  private final FunctionalComponentMapper functionalComponentMapper;

  public ProjectMapper(
      AppUserRepository appUserRepository, FunctionalComponentMapper functionalComponentMapper) {
    this.appUserRepository = appUserRepository;
    this.functionalComponentMapper = functionalComponentMapper;
  }

  public ProjectResponse toResponse(Project project) {
    var response =
        new ProjectResponse(
            project.getId(),
            project.getProjectName(),
            project.getVersion(),
            project.getCreatedAt(),
            project.getVersionCreatedAt(),
            project.getUpdatedAt(),
            project.getFunctionalComponents().stream()
                .filter(fc -> fc.getParentFCId() == null) // Only include top-level components
                .map(fc -> functionalComponentMapper.toResponse(fc))
                .filter(Objects::nonNull) // Filter out deleted components
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
        functionalComponentMapper.updateEntityFromRequest(project, request);

    Set<ProjectAppUser> projectAppUsers =
        request.getProjectAppUserIds().stream()
            .map(
                id ->
                    new ProjectAppUser(
                        id,
                        project,
                        appUserRepository
                            .findByProjectAppUserIdActive(id)
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
