package fi.fisma.backend.project;

import fi.fisma.backend.appuser.AppUser;
import fi.fisma.backend.appuser.AppUserRepository;
import fi.fisma.backend.security.SecurityConfig;
import fi.fisma.backend.security.UserDetailsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
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
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null)
                ),
                Set.of(new ProjectAppUser(13L)));
        when(projectRepository.findByProjectIdAndAppUserId(77L, 13L)).thenReturn(Optional.of(project));
    }
    
    @Test
    void shouldReturnAProjectWithAKnowId() {
        var response = mockMvc.get().uri("/projects/77").with(jwt().jwt(jwt -> jwt.subject("test-user")));
        
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
        var someonesProject = new Project(88L, "someones project", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null)
                ),
                Set.of(new ProjectAppUser(15L)));
        when(projectRepository.findByProjectIdAndAppUserId(88L, 15L)).thenReturn(Optional.of(someonesProject));
        
        assertThat(mockMvc.get().uri("/projects/88").with(jwt().jwt(jwt -> jwt.subject("test-user")))).hasStatus(HttpStatus.NOT_FOUND);
    }
    
    @Test
    void shouldReturnAllProjectsWhereAppUserIsListedAsAnProjectAppUser() {
        var projects = List.of(
                new Project(88L, "project one", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                        Set.of(
                                new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null),
                                new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null)
                        ),
                        Set.of(new ProjectAppUser(13L))),
                new Project(98L, "project two", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                        Set.of(
                                new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null),
                                new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null)
                        ),
                        Set.of(new ProjectAppUser(13L))));
        when(projectRepository.findAllByAppUserId(13L)).thenReturn(projects);
        
        var response = mockMvc.get().uri("/projects").with(jwt().jwt(jwt -> jwt.subject("test-user")));
        
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
        var projects = List.of(
                new Project(88L, "project one", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                        Set.of(
                                new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null),
                                new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null)
                        ),
                        Set.of(new ProjectAppUser(15L))),
                new Project(98L, "project two", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                        Set.of(
                                new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null),
                                new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null)
                        ),
                        Set.of(new ProjectAppUser(15L))));
        when(projectRepository.findAllByAppUserId(15L)).thenReturn(projects);
        
        var response = mockMvc.get().uri("/projects").with(jwt().jwt(jwt -> jwt.subject("test-user")));
        
        assertThat(response).hasStatusOk();
        
        assertThat(response).bodyJson().extractingPath("$.length()").isEqualTo(0);
    }
    
}