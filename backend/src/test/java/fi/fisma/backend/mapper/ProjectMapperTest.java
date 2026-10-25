package fi.fisma.backend.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import fi.fisma.backend.config.ClockConfig;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ProjectMapperTest {

  private ProjectMapper projectMapper;

  @BeforeEach
  void setUp() {
    projectMapper = mapperAt("2026-07-01T09:00:00Z");
  }

  private static ProjectMapper mapperAt(String utcInstant) {
    Clock clock = Clock.fixed(Instant.parse(utcInstant), new ClockConfig().clock().getZone());
    return new ProjectMapper(mock(FunctionalComponentMapper.class), clock);
  }

  @Test
  void timestampsAreFinnishLocalTimeInSummerAndWinter() {
    ProjectRequest request = new ProjectRequest();
    request.setProjectName("Test Project");

    // 09:00 UTC is 12:00 in Finland during summer time (UTC+3) and 11:00 in winter (UTC+2).
    LocalDateTime summer = mapperAt("2026-07-01T09:00:00Z").toEntity(request).getUpdatedAt();
    LocalDateTime winter = mapperAt("2026-12-01T09:00:00Z").toEntity(request).getUpdatedAt();

    assertThat(summer).isEqualTo(LocalDateTime.of(2026, 7, 1, 12, 0));
    assertThat(winter).isEqualTo(LocalDateTime.of(2026, 12, 1, 11, 0));
  }

  @Test
  void toResponseMapsReportFields() {
    Project project = project("Calculator", "Calculation note");

    ProjectResponse response = projectMapper.toResponse(project);

    assertThat(response.reportContactDetails()).isEqualTo("Calculator");
    assertThat(response.reportNotes()).isEqualTo("Calculation note");
  }

  @Test
  void toResponsePreservesNullReportFields() {
    Project project = project(null, null);

    ProjectResponse response = projectMapper.toResponse(project);

    assertThat(response.reportContactDetails()).isNull();
    assertThat(response.reportNotes()).isNull();
  }

  @Test
  void createNewVersionCopiesReportFields() {
    Project original = project("Calculator", "Calculation note");
    ProjectRequest request = new ProjectRequest();
    request.setProjectName("Test Project");
    request.setVersion(2);
    request.setCalculationDate(LocalDate.of(2026, 9, 3));
    request.setReportContactDetails(original.getReportContactDetails());
    request.setReportNotes(original.getReportNotes());

    Project newVersion = projectMapper.createNewVersion(original, request);

    assertThat(newVersion.getReportContactDetails()).isEqualTo("Calculator");
    assertThat(newVersion.getReportNotes()).isEqualTo("Calculation note");
    assertThat(newVersion.getCalculationDate()).isEqualTo(request.getCalculationDate());
  }

  private Project project(String reportContactDetails, String reportNotes) {
    LocalDateTime timestamp = LocalDateTime.of(2026, 9, 3, 12, 0);
    return new Project(
        1L,
        "Test Project",
        1,
        timestamp,
        timestamp,
        null,
        reportContactDetails,
        reportNotes,
        timestamp,
        null,
        null,
        Set.of(),
        Set.of());
  }
}
