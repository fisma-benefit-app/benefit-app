package fi.fisma.backend.project;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import fi.fisma.backend.appuser.AppUser;
import fi.fisma.backend.appuser.AppUserRepository;
import fi.fisma.backend.security.SecurityConfig;
import fi.fisma.backend.security.UserDetailsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;


@WebMvcTest(ProjectController.class)
@Import({SecurityConfig.class, UserDetailsServiceImpl.class})
class ProjectControllerTest {
    
    @Autowired
    MockMvcTester mockMvc;
    
    @MockitoBean
    ProjectRepository projectRepository;
    
    @MockitoBean
    AppUserRepository appUserRepository;
    
    @BeforeEach
    void setUp() {
        var appUser = new AppUser(13L, "test-user", "test-user-password");
        when(appUserRepository.findByUsername("test-user")).thenReturn(appUser);
        
        var project = new Project(77L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat")
                ),
                Set.of(new ProjectAppUser(13L)));
        when(projectRepository.findByProjectIdAndUsername(77L, "test-user")).thenReturn(Optional.of(project));
    }
    
    @Test
    void shouldReturnAProjectWithAKnowId() {
        var response = mockMvc.get().uri("/projects/77").with(jwt().jwt(jwt -> jwt.subject("test-user"))).exchange();
        
        assertThat(response).hasStatusOk();
        assertThat(response).bodyJson().extractingPath("$.id").isEqualTo(77);
        assertThat(response).bodyJson().extractingPath("$.projectName").isEqualTo("project-x");
        assertThat(response).bodyJson().extractingPath("$.version").isEqualTo(1);
        assertThat(response).bodyJson().extractingPath("$.createdDate").isEqualTo("2025-01-28T17:23:19");
        assertThat(response).bodyJson().extractingPath("$.totalPoints").isEqualTo(100.12);
        
        assertThat(response).bodyJson().extractingPath("$.functionalComponents.length()").isEqualTo(2);

//        assertThat(response).bodyJson().extractingPath("$.functionalComponents[*].id"); TODO - continue here and find out how to test functionalComponents (Set doesn't have an order).
        
        assertThat(response).bodyJson().extractingPath("$.appUsers.length()").isEqualTo(1);
        assertThat(response).bodyJson().extractingPath("$.appUsers[0].appUserId").isEqualTo(13);
    }
    
    @Test
    void shouldNotReturnAProjectAWithAnUnknowId() {
        assertThat(mockMvc.get().uri("/projects/777").with(jwt().jwt(jwt -> jwt.subject("test-user")))).hasStatus(HttpStatus.NOT_FOUND);
    }
    
    @Test
    void shouldNotReturnAProjectWithoutCredentials() {
        assertThat(mockMvc.get().uri("/projects/77")).hasStatus(HttpStatus.UNAUTHORIZED);
    }
    
    @Test
    void shouldNotReturnAProjectWhereUserIsNotListedAsAnProjectAppUser() {
        var someoneAppUser = new AppUser(15L, "someone", "someone-password");
        when(appUserRepository.findByUsername("someone")).thenReturn(someoneAppUser);
        var someonesProject = new Project(88L, "someones project", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat")
                ),
                Set.of(new ProjectAppUser(15L)));
        when(projectRepository.findByProjectIdAndUsername(88L, "someone")).thenReturn(Optional.of(someonesProject));
        
        assertThat(mockMvc.get().uri("/projects/88").with(jwt().jwt(jwt -> jwt.subject("test-user")))).hasStatus(HttpStatus.NOT_FOUND);
        
        assertThat(mockMvc.get().uri("/projects/88").with(jwt().jwt(jwt -> jwt.subject("someone")))).hasStatusOk();
    }
    
    @Test
    void shouldReturnAllProjectsWhereAppUserIsListedAsAnProjectAppUser() {
        var projects = List.of(
                new Project(88L, "project one", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                        Set.of(
                                new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                                new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat")
                        ),
                        Set.of(new ProjectAppUser(13L))),
                new Project(98L, "project two", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                        Set.of(
                                new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                                new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat")
                        ),
                        Set.of(new ProjectAppUser(13L))));
        when(projectRepository.findAllByUsername("test-user")).thenReturn(projects);
        
        var response = mockMvc.get().uri("/projects").with(jwt().jwt(jwt -> jwt.subject("test-user"))).exchange();
        
        assertThat(response).hasStatusOk();
        
        assertThat(response).bodyJson().extractingPath("$.length()").isEqualTo(2);
        
        assertThat(response).bodyJson().extractingPath("$[0].id").isEqualTo(88);
        assertThat(response).bodyJson().extractingPath("$[0].projectName").isEqualTo("project one");
        assertThat(response).bodyJson().extractingPath("$[0].version").isEqualTo(1);
        assertThat(response).bodyJson().extractingPath("$[0].createdDate").isEqualTo("2025-01-28T17:23:19");
        assertThat(response).bodyJson().extractingPath("$[0].totalPoints").isEqualTo(100.12);
        
        assertThat(response).bodyJson().extractingPath("$[1].id").isEqualTo(98);
        assertThat(response).bodyJson().extractingPath("$[1].projectName").isEqualTo("project two");
        assertThat(response).bodyJson().extractingPath("$[1].version").isEqualTo(1);
        assertThat(response).bodyJson().extractingPath("$[1].createdDate").isEqualTo("2025-01-28T17:23:19");
        assertThat(response).bodyJson().extractingPath("$[1].totalPoints").isEqualTo(100.12);
    }
    
    @Test
    void shouldNotReturnAProjectsWhereAppUserIsNotListedAsAProjectAppUserAndReturnEmptyList() {
        var someoneAppUser = new AppUser(15L, "someone", "someone-password");
        when(appUserRepository.findByUsername("someone")).thenReturn(someoneAppUser);
        var projects = List.of(
                new Project(88L, "project one", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                        Set.of(
                                new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                                new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat")
                        ),
                        Set.of(new ProjectAppUser(15L))),
                new Project(98L, "project two", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                        Set.of(
                                new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                                new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat")
                        ),
                        Set.of(new ProjectAppUser(15L))));
        when(projectRepository.findAllByUsername("someone")).thenReturn(projects);
        
        var response = mockMvc.get().uri("/projects").with(jwt().jwt(jwt -> jwt.subject("test-user"))).exchange();
        
        assertThat(response).hasStatusOk();
        
        assertThat(response).bodyJson().extractingPath("$.length()").isEqualTo(0);
    }
    
    @Test
    void shouldUpdateAndReturnAProjectWithAKnowId() throws JsonProcessingException {
        var updatedProject = new Project(77L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat"),
                        new FunctionalComponent(101L, null, null, null, null, null, null, null, null, null)
                ),
                Set.of(new ProjectAppUser(13L)));
        when(projectRepository.save(updatedProject)).thenReturn(updatedProject);
        
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        String updatedProjectJson = objectMapper.writeValueAsString(updatedProject);
        
        var response = mockMvc.put().uri("/projects/77").with(jwt().jwt(jwt -> jwt.subject("test-user"))).contentType(MediaType.APPLICATION_JSON).content(updatedProjectJson).exchange();
        
        assertThat(response).hasStatusOk();
        
        assertThat(response).bodyJson().extractingPath("$.id").isEqualTo(77);
        assertThat(response).bodyJson().extractingPath("$.projectName").isEqualTo("project-x");
        assertThat(response).bodyJson().extractingPath("$.version").isEqualTo(1);
        assertThat(response).bodyJson().extractingPath("$.createdDate").isEqualTo("2025-01-28T17:23:19");
        assertThat(response).bodyJson().extractingPath("$.totalPoints").isEqualTo(100.12);

//        assertThat(response).bodyJson().extractingPath("$.functionalComponents[*].id"); TODO - continue here and find out how to test functionalComponents (Set doesn't have an order).
        
        assertThat(response).bodyJson().extractingPath("$.functionalComponents.length()").isEqualTo(3);
        
        assertThat(response).bodyJson().extractingPath("$.appUsers.length()").isEqualTo(1);
        assertThat(response).bodyJson().extractingPath("$.appUsers[0].appUserId").isEqualTo(13);
    }
    
    @Test
    void shoudNotUpdateAProjectThatDoesNotExist() throws JsonProcessingException {
        var projectThatDoesNotExist = new Project(999L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat"),
                        new FunctionalComponent(101L, null, null, null, null, null, null, null, null, null)
                ),
                Set.of(new ProjectAppUser(13L)));
        when(projectRepository.save(projectThatDoesNotExist)).thenReturn(projectThatDoesNotExist);
        
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        String updatedProjectJson = objectMapper.writeValueAsString(projectThatDoesNotExist);
        
        var response = mockMvc.put().uri("/projects/999").with(jwt().jwt(jwt -> jwt.subject("test-user"))).contentType(MediaType.APPLICATION_JSON).content(updatedProjectJson).exchange();
        
        assertThat(response).hasStatus(HttpStatus.NOT_FOUND);
    }
    
    @Test
    void shouldNotUpdateAProjectWhereAppUserIsNotListedAsAProjectAppUser() throws JsonProcessingException {
        var someoneAppUser = new AppUser(13L, "someone", "someone-password");
        when(appUserRepository.findByUsername("someone")).thenReturn(someoneAppUser);
        var someonesProject = new Project(999L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(49L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                        new FunctionalComponent(400L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat")
                ),
                Set.of(new ProjectAppUser(16L)));
        when(projectRepository.findByProjectIdAndUsername(999L, "someone")).thenReturn(Optional.of(someonesProject));
        
        var projectThatIsTriedToUpdate = new Project(999L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat"),
                        new FunctionalComponent(101L, null, null, null, null, null, null, null, null, null)
                ),
                Set.of(new ProjectAppUser(13L)));
        when(projectRepository.save(projectThatIsTriedToUpdate)).thenReturn(projectThatIsTriedToUpdate);
        
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        String updatedProjectJson = objectMapper.writeValueAsString(projectThatIsTriedToUpdate);
        
        var response = mockMvc.put().uri("/projects/999").with(jwt().jwt(jwt -> jwt.subject("test-user"))).contentType(MediaType.APPLICATION_JSON).content(updatedProjectJson).exchange();
        
        assertThat(response).hasStatus(HttpStatus.NOT_FOUND);
    }
    
    @Test
    void shouldCreateANewProject() throws JsonProcessingException {
        var savedProject = new Project(44L, "new project name", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 0.00, Set.of(), Set.of(new ProjectAppUser(13L)));
        when(projectRepository.save(Mockito.any(Project.class))).thenReturn(savedProject);
        
        when(projectRepository.findByProjectIdAndUsername(44L, "test-user")).thenReturn(Optional.of(savedProject));
        
        var newProjectRequest = new Project(null, "new project name", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 0.00, Set.of(), Set.of(new ProjectAppUser(13L)));
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        String newProjectJson = objectMapper.writeValueAsString(newProjectRequest);
        
        var createResponse = mockMvc.post().uri("/projects").with(jwt().jwt(jwt -> jwt.subject("test-user"))).contentType(MediaType.APPLICATION_JSON).content(newProjectJson).exchange();
        
        assertThat(createResponse).hasStatus(HttpStatus.CREATED);
        
        String locationOfNewProject = createResponse.getResponse().getHeader("location");
        
        assertThat(locationOfNewProject).isNotNull();
        
        var response = mockMvc.get().uri(locationOfNewProject).with(jwt().jwt(jwt -> jwt.subject("test-user"))).exchange();
        
        assertThat(response).hasStatusOk();
        assertThat(response).bodyJson().extractingPath("$.id").isEqualTo(44);
        assertThat(response).bodyJson().extractingPath("$.projectName").isEqualTo("new project name");
        assertThat(response).bodyJson().extractingPath("$.version").isEqualTo(1);
        assertThat(response).bodyJson().extractingPath("$.createdDate").isEqualTo("2025-01-28T17:23:19");
        assertThat(response).bodyJson().extractingPath("$.totalPoints").isEqualTo(0.00);
        assertThat(response).bodyJson().extractingPath("$.functionalComponents.length()").isEqualTo(0);
        assertThat(response).bodyJson().extractingPath("$.appUsers.length()").isEqualTo(1);
        assertThat(response).bodyJson().extractingPath("$.appUsers[0].appUserId").isEqualTo(13);
    }
    
    @Test
    void shouldNotCreateANewProjectWithoutCredentials() throws JsonProcessingException {
        var savedProject = new Project(44L, "new project name", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 0.00, Set.of(), Set.of(new ProjectAppUser(13L)));
        when(projectRepository.save(Mockito.any(Project.class))).thenReturn(savedProject);
        
        when(projectRepository.findByProjectIdAndUsername(44L, "test-user")).thenReturn(Optional.of(savedProject));
        
        var newProjectRequest = new Project(null, "new project name", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 0.00, Set.of(), Set.of(new ProjectAppUser(13L)));
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        String newProjectJson = objectMapper.writeValueAsString(newProjectRequest);
        
        var createResponse = mockMvc.post().uri("/projects").contentType(MediaType.APPLICATION_JSON).content(newProjectJson).exchange();
        
        assertThat(createResponse).hasStatus(HttpStatus.FORBIDDEN);
    }
    
    @Test
    void shouldDeleteProject() {
        when(projectRepository.existsByProjectIdAndUsername(77L, "test-user")).thenReturn(true);
        
        var response = mockMvc.delete().uri("/projects/77").with(jwt().jwt(jwt -> jwt.subject("test-user"))).exchange();
        
        assertThat(response).hasStatus(HttpStatus.NO_CONTENT);
        
        verify(projectRepository, times(1)).deleteById(77L);
    }
    
    @Test
    void shouldNotDeleteProjectWithoutCredentials() {
        when(projectRepository.existsByProjectIdAndUsername(77L, "test-user")).thenReturn(true);
        
        var response = mockMvc.delete().uri("/projects/77").exchange();
        
        assertThat(response).hasStatus(HttpStatus.FORBIDDEN);
        
        verify(projectRepository, times(0)).deleteById(77L);
    }
    
    @Test
    void shouldNotDeleteProjectWhereAppUserIsNotListedAsAProjectAppUser() {
        when(projectRepository.existsByProjectIdAndUsername(77L, "test-user")).thenReturn(true);
        
        var someoneAppUser = new AppUser(15L, "someone", "someone-password");
        when(appUserRepository.findByUsername("someone")).thenReturn(someoneAppUser);
        
        var response = mockMvc.delete().uri("/projects/77").with(jwt().jwt(jwt -> jwt.subject("someone"))).exchange();
        
        assertThat(response).hasStatus(HttpStatus.NOT_FOUND);
        
        verify(projectRepository, times(0)).deleteById(77L);
    }
    
    @Test
    void shouldNotDeleteProjectThatDoesNotExist() {
        when(projectRepository.existsByProjectIdAndUsername(777L, "test-user")).thenReturn(false);
        
        var response = mockMvc.delete().uri("/projects/777").with(jwt().jwt(jwt -> jwt.subject("test-user"))).exchange();
        
        assertThat(response).hasStatus(HttpStatus.NOT_FOUND);
        
        verify(projectRepository, times(0)).deleteById(777L);
    }
    
}