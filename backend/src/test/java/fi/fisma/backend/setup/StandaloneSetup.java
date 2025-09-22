package fi.fisma.backend.setup;

import static org.mockito.Mockito.when;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.domain.ProjectAppUser;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

public class StandaloneSetup {

  private StandaloneSetup() {
    // utility class -> prevent instantiation
  }

  public static AppUser testUser() {
    return new AppUser(13L, "test-user", "test-user-password");
  }

  public static AppUser someoneAppUser() {
    return new AppUser(15L, "someone", "someone-password");
  }

  public static Project testProject() {
    return new Project(
        77L,
        "project-x",
        1,
        LocalDateTime.of(2025, 1, 28, 17, 23, 19),
        LocalDateTime.of(2025, 1, 28, 17, 23, 19),
        LocalDateTime.of(2025, 1, 28, 17, 23, 19),
        100.12,
        Set.of(
            new FunctionalComponent(
                99L,
                "Interactive end-user input service",
                "1-functional",
                2,
                4,
                3,
                1,
                null,
                0.34,
                "hakijan valinnat",
                99L,
                0),
            new FunctionalComponent(
                100L,
                "Data storage service",
                "entities or classes",
                4,
                null,
                null,
                null,
                null,
                0.34,
                "hakijan valinnat",
                100L,
                0)),
        Set.of(new ProjectAppUser(13L)));
  }

  public static Project someonesProject() {
    return new Project(
        88L,
        "someones project",
        1,
        LocalDateTime.of(2025, 1, 28, 17, 23, 19),
        LocalDateTime.of(2025, 1, 28, 17, 23, 19),
        LocalDateTime.of(2025, 1, 28, 17, 23, 19),
        100.12,
        Set.of(
            new FunctionalComponent(
                99L,
                "Interactive end-user input service",
                "1-functional",
                2,
                4,
                3,
                1,
                null,
                0.34,
                "hakijan valinnat",
                99L,
                0),
            new FunctionalComponent(
                100L,
                "Data storage service",
                "entities or classes",
                4,
                null,
                null,
                null,
                null,
                0.34,
                "hakijan valinnat",
                100L,
                0)),
        Set.of(new ProjectAppUser(15L)));
  }

  public static Project anotherProject() {
    return new Project(
        98L,
        "project two",
        1,
        LocalDateTime.of(2025, 1, 28, 17, 23, 19),
        LocalDateTime.of(2025, 1, 28, 17, 23, 19),
        LocalDateTime.of(2025, 1, 28, 17, 23, 19),
        100.12,
        Set.of(
            new FunctionalComponent(
                99L,
                "Interactive end-user input service",
                "1-functional",
                2,
                4,
                3,
                1,
                null,
                0.34,
                "hakijan valinnat",
                99L,
                0),
            new FunctionalComponent(
                100L,
                "Data storage service",
                "entities or classes",
                4,
                null,
                null,
                null,
                null,
                0.34,
                "hakijan valinnat",
                100L,
                0)),
        Set.of(new ProjectAppUser(13L)));
  }

  public static void setupMocks(
      AppUserRepository appUserRepository, ProjectRepository projectRepository) {
    var user = testUser();
    var project = testProject();

    when(appUserRepository.findByUsername("test-user")).thenReturn(user);
    when(projectRepository.findByProjectIdAndUsername(77L, "test-user"))
        .thenReturn(Optional.of(project));
  }
}
