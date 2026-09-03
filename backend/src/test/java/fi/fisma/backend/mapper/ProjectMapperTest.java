package fi.fisma.backend.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.repository.AppUserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ProjectMapperTest {

  private ProjectMapper projectMapper;

  @BeforeEach
  void setUp() {
    projectMapper = new ProjectMapper(mock(AppUserRepository.class), mock(FunctionalComponentMapper.class));
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
        Set.of(),
        Set.of());
  }
}
