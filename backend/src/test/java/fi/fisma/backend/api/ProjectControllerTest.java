package fi.fisma.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest(ProjectController.class)
@Import({SecurityConfig.class, UserDetailsServiceImpl.class})
class ProjectControllerTest {

  @Autowired MockMvcTester mockMvc;

  @Autowired ObjectMapper objectMapper;

  @MockitoBean ProjectService projectService;

  @MockitoBean ProjectRepository projectRepository;

  @MockitoBean AppUserRepository appUserRepository;

  @BeforeEach
  void setUp() {
    var project1 = StandaloneSetup.testProject();
    var project2 = StandaloneSetup.anotherProject();
    var projects = List.of(project1, project2);
    var someonesProject = StandaloneSetup.someonesProject();

    // Positive case
    when(projectService.getProject(77L, "test-user")).thenReturn(project1);
    when(projectService.getAllProjects("test-user")).thenReturn(projects);

    // Negative case: test-user should NOT see someone’s project → throw EntityNotFoundException
    when(projectService.getProject(88L, "test-user"))
        .thenThrow(new EntityNotFoundException("Project not found with id: 88"));

    // Positive case: someone can see their project
    when(projectService.getProject(88L, "someone")).thenReturn(someonesProject);
  }

  @Test
  void shouldReturnAProjectWithAKnownId() {
    var response =
        mockMvc
            .get()
            .uri("/projects/77")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .exchange();

    // top-level fields
    assertThat(response).hasStatusOk();
    assertThat(response).bodyJson().extractingPath("$.id").isEqualTo(77);
    assertThat(response).bodyJson().extractingPath("$.projectName").isEqualTo("project-x");
    assertThat(response).bodyJson().extractingPath("$.version").isEqualTo(1);
    assertThat(response)
        .bodyJson()
        .extractingPath("$.createdDate")
        .isEqualTo("2025-01-28T17:23:19");
    assertThat(response).bodyJson().extractingPath("$.totalPoints").isEqualTo(100.12);

    // nested collections
    assertThat(response).bodyJson().extractingPath("$.functionalComponents.length()").isEqualTo(2);
    assertThat(response).bodyJson().extractingPath("$.appUsers.length()").isEqualTo(1);
    assertThat(response).bodyJson().extractingPath("$.appUsers[0].appUserId").isEqualTo(13);
  }

  @Test
  void shouldNotReturnAProjectWithAnUnknownId() {
    when(projectService.getProject(777L, "test-user"))
        .thenThrow(new EntityNotFoundException("Project not found with id: 777"));

    assertThat(mockMvc.get().uri("/projects/777").with(jwt().jwt(jwt -> jwt.subject("test-user"))))
        .hasStatus(HttpStatus.NOT_FOUND);
  }

  @Test
  void shouldNotReturnAProjectWithoutCredentials() {
    // no .with(jwt(...)) → request is unauthorized
    assertThat(mockMvc.get().uri("/projects/77")).hasStatus(HttpStatus.UNAUTHORIZED);
  }

  @Test
  void shouldNotReturnAProjectWhereUserIsNotListedAsAnProjectAppUser() {
    // test-user not allowed → 404
    assertThat(mockMvc.get().uri("/projects/88").with(jwt().jwt(jwt -> jwt.subject("test-user"))))
        .hasStatus(HttpStatus.NOT_FOUND);

    // someone allowed → 200
    assertThat(mockMvc.get().uri("/projects/88").with(jwt().jwt(jwt -> jwt.subject("someone"))))
        .hasStatusOk();
  }

  /*

  @Test
  void shouldReturnAllProjectsWhereAppUserIsListedAsAnProjectAppUser() {
    var response = mockMvc.get()
            .uri("/projects")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .exchange();

    // assert status
    assertThat(response).hasStatusOk();

    // parse JSON response
    String content = response.responseBody(); // or response.getBodyAsString(), depending on your API
    Project[] returnedProjects = objectMapper.readValue(content, Project[].class);

    // assert length
    assertThat(returnedProjects.length).isEqualTo(projects.size());

    // assert fields dynamically
    for (int i = 0; i < projects.size(); i++) {
        var expected = projects.get(i);
        var actual = returnedProjects[i];
        assertThat(actual.getId()).isEqualTo(expected.getId());
        assertThat(actual.getProjectName()).isEqualTo(expected.getProjectName());
        assertThat(actual.getVersion()).isEqualTo(expected.getVersion());
        assertThat(actual.getCreatedDate()).isEqualTo(expected.getCreatedDate());
        assertThat(actual.getTotalPoints()).isEqualTo(expected.getTotalPoints());
    }
  }

  @Test
  void shouldNotReturnAProjectsWhereAppUserIsNotListedAsAProjectAppUserAndReturnEmptyList() {
    var someoneAppUser = new AppUser(15L, "someone", "someone-password");
    when(appUserRepository.findByUsername("someone")).thenReturn(someoneAppUser);
    var projects =
        List.of(
            new Project(
                88L,
                "project one",
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
                Set.of(new ProjectAppUser(15L))),
            new Project(
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
                Set.of(new ProjectAppUser(15L))));
    when(projectRepository.findAllByUsername("someone")).thenReturn(projects);

    var response =
        mockMvc.get().uri("/projects").with(jwt().jwt(jwt -> jwt.subject("test-user"))).exchange();

    assertThat(response).hasStatusOk();

    assertThat(response).bodyJson().extractingPath("$.length()").isEqualTo(0);
  }

  @Test
  void shouldUpdateAndReturnAProjectWithAKnowId() throws JsonProcessingException {
    var updatedProject =
        new Project(
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
                    0),
                new FunctionalComponent(
                    101L, null, null, null, null, null, null, null, null, null, 101L, 0)),
            Set.of(new ProjectAppUser(13L)));
    when(projectRepository.save(updatedProject)).thenReturn(updatedProject);

    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    String updatedProjectJson = objectMapper.writeValueAsString(updatedProject);

    var response =
        mockMvc
            .put()
            .uri("/projects/77")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .contentType(MediaType.APPLICATION_JSON)
            .content(updatedProjectJson)
            .exchange();

    assertThat(response).hasStatusOk();

    assertThat(response).bodyJson().extractingPath("$.id").isEqualTo(77);
    assertThat(response).bodyJson().extractingPath("$.projectName").isEqualTo("project-x");
    assertThat(response).bodyJson().extractingPath("$.version").isEqualTo(1);
    assertThat(response)
        .bodyJson()
        .extractingPath("$.createdDate")
        .isEqualTo("2025-01-28T17:23:19");
    assertThat(response).bodyJson().extractingPath("$.totalPoints").isEqualTo(100.12);

    //        assertThat(response).bodyJson().extractingPath("$.functionalComponents[*].id"); TODO -
    // continue here and find out how to test functionalComponents (Set doesn't have an order).

    assertThat(response).bodyJson().extractingPath("$.functionalComponents.length()").isEqualTo(3);

    assertThat(response).bodyJson().extractingPath("$.appUsers.length()").isEqualTo(1);
    assertThat(response).bodyJson().extractingPath("$.appUsers[0].appUserId").isEqualTo(13);
  }

  @Test
  void shoudNotUpdateAProjectThatDoesNotExist() throws JsonProcessingException {
    var projectThatDoesNotExist =
        new Project(
            999L,
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
                    0),
                new FunctionalComponent(
                    101L, null, null, null, null, null, null, null, null, null, 101L, 0)),
            Set.of(new ProjectAppUser(13L)));
    when(projectRepository.save(projectThatDoesNotExist)).thenReturn(projectThatDoesNotExist);

    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    String updatedProjectJson = objectMapper.writeValueAsString(projectThatDoesNotExist);

    var response =
        mockMvc
            .put()
            .uri("/projects/999")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .contentType(MediaType.APPLICATION_JSON)
            .content(updatedProjectJson)
            .exchange();

    assertThat(response).hasStatus(HttpStatus.NOT_FOUND);
  }

  @Test
  void shouldNotUpdateAProjectWhereAppUserIsNotListedAsAProjectAppUser()
      throws JsonProcessingException {
    var someoneAppUser = new AppUser(13L, "someone", "someone-password");
    when(appUserRepository.findByUsername("someone")).thenReturn(someoneAppUser);
    var someonesProject =
        new Project(
            999L,
            "project-x",
            1,
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            100.12,
            Set.of(
                new FunctionalComponent(
                    49L,
                    "Interactive end-user input service",
                    "1-functional",
                    2,
                    4,
                    3,
                    1,
                    null,
                    0.34,
                    "hakijan valinnat",
                    49L,
                    0),
                new FunctionalComponent(
                    400L,
                    "Data storage service",
                    "entities or classes",
                    4,
                    null,
                    null,
                    null,
                    null,
                    0.34,
                    "hakijan valinnat",
                    400L,
                    0)),
            Set.of(new ProjectAppUser(16L)));
    when(projectRepository.findByProjectIdAndUsername(999L, "someone"))
        .thenReturn(Optional.of(someonesProject));

    var projectThatIsTriedToUpdate =
        new Project(
            999L,
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
                    0),
                new FunctionalComponent(
                    101L, null, null, null, null, null, null, null, null, null, 101L, 0)),
            Set.of(new ProjectAppUser(13L)));
    when(projectRepository.save(projectThatIsTriedToUpdate)).thenReturn(projectThatIsTriedToUpdate);

    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    String updatedProjectJson = objectMapper.writeValueAsString(projectThatIsTriedToUpdate);

    var response =
        mockMvc
            .put()
            .uri("/projects/999")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .contentType(MediaType.APPLICATION_JSON)
            .content(updatedProjectJson)
            .exchange();

    assertThat(response).hasStatus(HttpStatus.NOT_FOUND);
  }

  @Test
  void shouldCreateANewProject() throws JsonProcessingException {
    var savedProject =
        new Project(
            44L,
            "new project name",
            1,
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            0.00,
            Set.of(),
            Set.of(new ProjectAppUser(13L)));
    when(projectRepository.save(Mockito.any(Project.class))).thenReturn(savedProject);

    when(projectRepository.findByProjectIdAndUsername(44L, "test-user"))
        .thenReturn(Optional.of(savedProject));

    var newProjectRequest =
        new Project(
            null,
            "new project name",
            1,
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            0.00,
            Set.of(),
            Set.of(new ProjectAppUser(13L)));
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    String newProjectJson = objectMapper.writeValueAsString(newProjectRequest);

    var createResponse =
        mockMvc
            .post()
            .uri("/projects")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .contentType(MediaType.APPLICATION_JSON)
            .content(newProjectJson)
            .exchange();

    assertThat(createResponse).hasStatus(HttpStatus.CREATED);

    String locationOfNewProject = createResponse.getResponse().getHeader("location");

    assertThat(locationOfNewProject).isNotNull();

    var response =
        mockMvc
            .get()
            .uri(locationOfNewProject)
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .exchange();

    assertThat(response).hasStatusOk();
    assertThat(response).bodyJson().extractingPath("$.id").isEqualTo(44);
    assertThat(response).bodyJson().extractingPath("$.projectName").isEqualTo("new project name");
    assertThat(response).bodyJson().extractingPath("$.version").isEqualTo(1);
    assertThat(response)
        .bodyJson()
        .extractingPath("$.createdDate")
        .isEqualTo("2025-01-28T17:23:19");
    assertThat(response).bodyJson().extractingPath("$.totalPoints").isEqualTo(0.00);
    assertThat(response).bodyJson().extractingPath("$.functionalComponents.length()").isEqualTo(0);
    assertThat(response).bodyJson().extractingPath("$.appUsers.length()").isEqualTo(1);
    assertThat(response).bodyJson().extractingPath("$.appUsers[0].appUserId").isEqualTo(13);
  }

  @Test
  void shouldNotCreateANewProjectWithoutCredentials() throws JsonProcessingException {
    var savedProject =
        new Project(
            44L,
            "new project name",
            1,
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            0.00,
            Set.of(),
            Set.of(new ProjectAppUser(13L)));
    when(projectRepository.save(Mockito.any(Project.class))).thenReturn(savedProject);

    when(projectRepository.findByProjectIdAndUsername(44L, "test-user"))
        .thenReturn(Optional.of(savedProject));

    var newProjectRequest =
        new Project(
            null,
            "new project name",
            1,
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            LocalDateTime.of(2025, 1, 28, 17, 23, 19),
            0.00,
            Set.of(),
            Set.of(new ProjectAppUser(13L)));
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    String newProjectJson = objectMapper.writeValueAsString(newProjectRequest);

    var createResponse =
        mockMvc
            .post()
            .uri("/projects")
            .contentType(MediaType.APPLICATION_JSON)
            .content(newProjectJson)
            .exchange();

    assertThat(createResponse).hasStatus(HttpStatus.FORBIDDEN);
  }

  @Test
  void shouldDeleteProject() {
    // Should use findByProjectIdAndUsername!
    when(projectRepository.existsByProjectIdAndUsername(77L, "test-user")).thenReturn(true);

    var response =
        mockMvc
            .delete()
            .uri("/projects/77")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .exchange();

    assertThat(response).hasStatus(HttpStatus.NO_CONTENT);

    verify(projectRepository, times(1)).deleteById(77L);
  }

  @Test
  void shouldNotDeleteProjectWithoutCredentials() {
    // Should use findByProjectIdAndUsername!
    when(projectRepository.existsByProjectIdAndUsername(77L, "test-user")).thenReturn(true);

    var response = mockMvc.delete().uri("/projects/77").exchange();

    assertThat(response).hasStatus(HttpStatus.FORBIDDEN);

    verify(projectRepository, times(0)).deleteById(77L);
  }

  @Test
  void shouldNotDeleteProjectWhereAppUserIsNotListedAsAProjectAppUser() {
    // Should use findByProjectIdAndUsername!
    when(projectRepository.existsByProjectIdAndUsername(77L, "test-user")).thenReturn(true);

    var someoneAppUser = new AppUser(15L, "someone", "someone-password");
    when(appUserRepository.findByUsername("someone")).thenReturn(someoneAppUser);

    var response =
        mockMvc
            .delete()
            .uri("/projects/77")
            .with(jwt().jwt(jwt -> jwt.subject("someone")))
            .exchange();

    assertThat(response).hasStatus(HttpStatus.NOT_FOUND);

    verify(projectRepository, times(0)).deleteById(77L);
  }

  @Test
  void shouldNotDeleteProjectThatDoesNotExist() {
    // Should use findByProjectIdAndUsername!
    when(projectRepository.existsByProjectIdAndUsername(777L, "test-user")).thenReturn(false);

    var response =
        mockMvc
            .delete()
            .uri("/projects/777")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .exchange();

    assertThat(response).hasStatus(HttpStatus.NOT_FOUND);

    verify(projectRepository, times(0)).deleteById(777L);
  }
  */
}
