package fi.fisma.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import fi.fisma.backend.security.JwtRevocationFilter;
import fi.fisma.backend.security.SecurityConfig;
import fi.fisma.backend.security.UserDetailsServiceImpl;
import fi.fisma.backend.service.ProjectService;
import fi.fisma.backend.setup.StandaloneSetup;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
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
@Import({SecurityConfig.class, UserDetailsServiceImpl.class, JwtRevocationFilter.class})
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

  private ProjectResponse project;
  private List<ProjectResponse> projects;
  private ProjectResponse updated;
  private ProjectResponse savedProject;
  private ProjectResponse savedVersion;

  @BeforeEach
  void setUp() {
    project = StandaloneSetup.project();
    projects = StandaloneSetup.projects();
    updated = StandaloneSetup.updated();
    savedProject = StandaloneSetup.savedProject();
    savedVersion = StandaloneSetup.savedVersion();
  }

  @Test
  void testGetProject() {
    when(projectService.getProject(1L, "test-user")).thenReturn(project);

    var response = mockMvcTester.get().uri("/projects/{id}", 1L).with(jwtAuth).exchange();

    assertThat(response).hasStatusOk();
    assertThat(response).bodyJson().extractingPath("$.id").isEqualTo(1);
    assertThat(response).bodyJson().extractingPath("$.projectName").isEqualTo("Test Project");
  }

  @Test
  void testGetAllProjects() throws Exception {
    when(projectService.getAllProjects("test-user")).thenReturn(projects);

    var response = mockMvcTester.get().uri("/projects").with(jwtAuth).exchange();

    assertThat(response).hasStatusOk();

    ProjectResponse[] returned =
        objectMapper.readValue(
            response.getResponse().getContentAsByteArray(), ProjectResponse[].class);
    assertThat(returned).hasSize(2);
  }

  @Test
  void testUpdateProject() {
    ProjectRequest updateReq = new ProjectRequest();
    updateReq.setProjectName("Updated Project");
    updateReq.setVersion(2);

    when(projectService.updateProject(eq(1L), any(ProjectRequest.class), eq("test-user")))
        .thenReturn(updated);

    var response =
        mockMvcTester
            .put()
            .uri("/projects/{id}", 1L)
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "projectName": "Updated Project",
                  "version": 2
                }
                """)
            .exchange();

    assertThat(response).hasStatusOk();
    assertThat(response).bodyJson().extractingPath("$.projectName").isEqualTo("Updated Project");
  }

  @Test
  void testCreateProject_Success() {
    ProjectRequest newProject = new ProjectRequest();
    newProject.setProjectName("New Project");
    newProject.setVersion(1);

    when(projectService.createProject(any(ProjectRequest.class), eq("test-user")))
        .thenReturn(savedProject);

    var response =
        mockMvcTester
            .post()
            .uri("/projects")
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "projectName": "New Project",
                  "version": 1
                }
                """)
            .exchange();

    assertThat(response).hasStatus(HttpStatus.CREATED);
    assertThat(response.getResponse().getHeader("Location"))
        .isEqualTo("http://localhost/projects/1");
  }

  @Test
  void testCreateProjectVersion_Success() {
    ProjectRequest versionReq = new ProjectRequest();
    versionReq.setProjectName("Versioned Project");
    versionReq.setVersion(2);

    when(projectService.createProjectVersion(eq(1L), any(ProjectRequest.class), eq("test-user")))
        .thenReturn(savedVersion);

    var response =
        mockMvcTester
            .post()
            .uri("/projects/{id}/versions", 1L)
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "projectName": "Versioned Project",
                  "version": 2
                }
                """)
            .exchange();

    assertThat(response).hasStatus(HttpStatus.CREATED);
    assertThat(response.getResponse().getHeader("Location"))
        .isEqualTo("http://localhost/projects/2");
  }

  @Test
  void testDeleteProject() {
    doNothing().when(projectService).deleteProject(1L, "test-user");

    var response = mockMvcTester.delete().uri("/projects/{id}", 1L).with(jwtAuth).exchange();

    assertThat(response).hasStatus(HttpStatus.NO_CONTENT);
    verify(projectService).deleteProject(1L, "test-user");
  }
}
