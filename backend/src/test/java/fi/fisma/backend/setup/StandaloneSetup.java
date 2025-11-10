package fi.fisma.backend.setup;

import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.PasswordChangeRequest;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/*
 * Utility class for setting up commonly used test data and mock behaviors.
 */

public class StandaloneSetup {

  private StandaloneSetup() {
    // utility class -> prevent instantiation
  }

  public static ProjectResponse project() {
    return new ProjectResponse(
        1L,
        "Test Project",
        1,
        LocalDateTime.now(),
        LocalDateTime.now(),
        LocalDateTime.now(),
        Set.of(),
        Set.of());
  }

  public static List<ProjectResponse> projects() {
    return List.of(
        new ProjectResponse(
            1L,
            "P1",
            1,
            LocalDateTime.now(),
            LocalDateTime.now(),
            LocalDateTime.now(),
            Set.of(),
            Set.of()),
        new ProjectResponse(
            2L,
            "P2",
            1,
            LocalDateTime.now(),
            LocalDateTime.now(),
            LocalDateTime.now(),
            Set.of(),
            Set.of()));
  }

  public static ProjectResponse updated() {
    return new ProjectResponse(
        1L,
        "Updated Project",
        2,
        LocalDateTime.now(),
        LocalDateTime.now(),
        LocalDateTime.now(),
        Set.of(),
        Set.of());
  }

  public static ProjectResponse savedProject() {
    return new ProjectResponse(
        1L,
        "New Project",
        1,
        LocalDateTime.now(),
        LocalDateTime.now(),
        LocalDateTime.now(),
        Set.of(),
        Set.of());
  }

  public static ProjectResponse savedVersion() {
    return new ProjectResponse(
        2L,
        "Versioned Project",
        2,
        LocalDateTime.now(),
        LocalDateTime.now(),
        LocalDateTime.now(),
        Set.of(),
        Set.of());
  }

  public static FunctionalComponentRequest createFunctionalComponentRequest(
      FunctionalComponentRequest dto) {
    dto.setId(1L);
    dto.setTitle("Create User Account");
    dto.setDescription("Handles user account creation process");
    dto.setClassName("UserAccount");
    dto.setComponentType("Entity");
    dto.setDataElements(5);
    dto.setReadingReferences(2);
    dto.setWritingReferences(1);
    dto.setFunctionalMultiplier(3);
    dto.setOperations(4);
    dto.setDegreeOfCompletion(0.75);
    dto.setPreviousFCId(123L);
    dto.setOrderPosition(1);
    return dto;
  }

  public static PasswordChangeRequest createPasswordChangeRequest(PasswordChangeRequest dto) {
    dto.setNewPassword("mySecret123");
    return dto;
  }

  public static ProjectRequest createProjectRequest(ProjectRequest dto) {
    dto.setProjectName("User Authentication System");
    dto.setVersion(1);
    dto.setProjectAppUserIds(Set.of(10L, 20L));
    return dto;
  }
}
