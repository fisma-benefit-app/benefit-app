package fi.fisma.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.domain.EnumProjectRole;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.domain.ProjectAppUser;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.mapper.FunctionalComponentMapper;
import fi.fisma.backend.mapper.ProjectMapper;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.FunctionalComponentRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.time.Clock;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ProjectServiceTest {

  private AppUserRepository appUserRepository;
  private ProjectRepository projectRepository;
  private FunctionalComponentMapper functionalComponentMapper;
  private ProjectMapper projectMapper;
  private Project project;
  private AppUser appUser;
  private ProjectService projectService;

  @BeforeEach
  void setUp() {
    appUserRepository = mock(AppUserRepository.class);
    projectRepository = mock(ProjectRepository.class);
    functionalComponentMapper = mock(FunctionalComponentMapper.class);
    projectMapper = mock(ProjectMapper.class);
    project = mock(Project.class);
    appUser = mock(AppUser.class);
    projectService =
        new ProjectService(
            projectRepository,
            appUserRepository,
            mock(FunctionalComponentRepository.class),
            functionalComponentMapper,
            projectMapper,
            Clock.systemDefaultZone());

    when(appUserRepository.findByUsernameActive("alice")).thenReturn(Optional.of(appUser));
    when(projectMapper.toEntity(any(ProjectRequest.class))).thenReturn(project);
    when(functionalComponentMapper.updateEntityFromRequest(any(), any())).thenReturn(Set.of());
    when(projectRepository.save(project)).thenReturn(project);
  }

  @Test
  void createProjectAssignsOwnerRoleToCreator() {
    var projectUsers = new AtomicReference<Set<ProjectAppUser>>();
    doAnswer(
            invocation -> {
              projectUsers.set(invocation.getArgument(0));
              return null;
            })
        .when(project)
        .setProjectAppUsers(anySet());

    projectService.createProject(new ProjectRequest(), "alice");

    assertThat(projectUsers.get()).hasSize(1);
    assertThat(projectUsers.get().iterator().next().getRoleInProject())
        .isEqualTo(EnumProjectRole.owner);
  }
}
