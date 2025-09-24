package fi.fisma.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import fi.fisma.backend.security.SecurityConfig;
import fi.fisma.backend.security.UserDetailsServiceImpl;
import fi.fisma.backend.service.ProjectService;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest(ProjectController.class)
@Import({SecurityConfig.class, UserDetailsServiceImpl.class})
class ProjectControllerTest {

  @Autowired MockMvcTester mockMvcTester;
  @Autowired ObjectMapper objectMapper;

  @MockitoBean ProjectService projectService;
  @MockitoBean ProjectRepository projectRepository;
  @MockitoBean AppUserRepository appUserRepository;

  private final JwtRequestPostProcessor jwtAuth =
      org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
          .jwt()
          .jwt(jwt -> jwt.subject("test-user"));

  @Test
  void testGetProject() {
    Project project = new Project();
    project.setId(1L);

    when(projectService.getProject(1L, "test-user")).thenReturn(project);

    var response = mockMvcTester.get().uri("/projects/{id}", 1L).with(jwtAuth).exchange();

    assertThat(response).hasStatusOk();
    assertThat(response).bodyJson().extractingPath("$.id").isEqualTo(1);
  }

  @Test
  void testGetAllProjects() throws Exception {
    Project project1 = new Project();
    project1.setId(1L);
    Project project2 = new Project();
    project2.setId(2L);
    List<Project> projects = Arrays.asList(project1, project2);

    when(projectService.getAllProjects("test-user")).thenReturn(List.of(project1, project2));

    var response = mockMvcTester.get().uri("/projects").with(jwtAuth).exchange();

    assertThat(response).hasStatusOk();

    Project[] returnedProjects =
        objectMapper.readValue(response.getResponse().getContentAsByteArray(), Project[].class);
    assertThat(returnedProjects).hasSize(projects.size());
  }

  @Test
  void testUpdateProject() {
    Project updated = new Project();
    updated.setId(1L);

    when(projectService.updateProject(eq(1L), any(Project.class), eq("test-user")))
        .thenReturn(updated);

    var response =
        mockMvcTester
            .put()
            .uri("/projects/{id}", 1L)
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"id\":1}")
            .exchange();

    assertThat(response).hasStatusOk();
    assertThat(response).bodyJson().extractingPath("$.id").isEqualTo(1);
  }

  @Test
  void testCreateProject_Success() {
    Project saved = new Project();
    saved.setId(1L);

    when(projectService.createProject(any(Project.class), eq("test-user")))
        .thenReturn(Optional.of(saved));

    var response =
        mockMvcTester
            .post()
            .uri("/projects")
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"id\":1}")
            .exchange();

    assertThat(response).hasStatus(HttpStatus.CREATED);
  }

  @Test
  void testCreateProject_Unauthorized() {
    when(projectService.createProject(any(Project.class), eq("test-user")))
        .thenReturn(Optional.empty());

    var response =
        mockMvcTester
            .post()
            .uri("/projects")
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"id\":1}")
            .exchange();

    assertThat(response).hasStatus(HttpStatus.UNAUTHORIZED);
  }

  @Test
  void testCreateProjectVersion_Success() {
    Project saved = new Project();
    saved.setId(2L);

    when(projectService.createProjectVersion(any(Project.class), eq("test-user")))
        .thenReturn(Optional.of(saved));

    var response =
        mockMvcTester
            .post()
            .uri("/projects/create-version")
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"id\":2}")
            .exchange();

    assertThat(response).hasStatus(HttpStatus.CREATED);
  }

  @Test
  void testCreateProjectVersion_Unauthorized() {
    when(projectService.createProjectVersion(any(Project.class), eq("test-user")))
        .thenReturn(Optional.empty());

    var response =
        mockMvcTester
            .post()
            .uri("/projects/create-version")
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"id\":2}")
            .exchange();

    assertThat(response).hasStatus(HttpStatus.UNAUTHORIZED);
  }

  @Test
  void testDeleteProject() {
    doNothing().when(projectService).deleteProject(1L, "test-user");

    var response = mockMvcTester.delete().uri("/projects/{id}", 1L).with(jwtAuth).exchange();

    assertThat(response).hasStatus(HttpStatus.NO_CONTENT);

    verify(projectService).deleteProject(1L, "test-user");
  }
}
