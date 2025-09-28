package fi.fisma.backend.setup;

import fi.fisma.backend.dto.AppUserSummary;
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

  public static AppUserSummary appUserSummary() {
    return new AppUserSummary(1L, "john.doe");
  }

  public static ProjectResponse project() {
    return new ProjectResponse(
        1L,
        "Test Project",
        1,
        LocalDateTime.now(),
        LocalDateTime.now(),
        LocalDateTime.now(),
        100.0,
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
            50.0,
            Set.of(),
            Set.of()),
        new ProjectResponse(
            2L,
            "P2",
            1,
            LocalDateTime.now(),
            LocalDateTime.now(),
            LocalDateTime.now(),
            75.0,
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
        120.0,
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
        80.0,
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
        95.0,
        Set.of(),
        Set.of());
  }
}
