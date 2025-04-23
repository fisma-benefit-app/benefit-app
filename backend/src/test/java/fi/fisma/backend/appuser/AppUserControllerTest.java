package fi.fisma.backend.appuser;

import fi.fisma.backend.project.*;
import fi.fisma.backend.security.SecurityConfig;
import fi.fisma.backend.security.UserDetailsServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

@WebMvcTest({AppUserController.class, ProjectController.class})
@Import({SecurityConfig.class, UserDetailsServiceImpl.class})
class AppUserControllerTest {
    
    @Autowired
    MockMvcTester mockMvc;
    
    @MockitoBean
    AppUserRepository appUserRepository;
    
    @MockitoBean
    ProjectRepository projectRepository;
    
    @Test
    void shoudUpdateAppUserPassword() {
        var appUser = new AppUser(13L, "test-user", "old-password");
        
        when(appUserRepository.findByUsername("test-user")).thenReturn(appUser);
        
        var response = mockMvc.put().uri("/appusers").with(jwt().jwt(jwt -> jwt.subject("test-user"))).contentType(MediaType.APPLICATION_JSON).content("\"new-password\"").exchange();
        assertThat(response).hasStatus(HttpStatus.NO_CONTENT);
    }
    
    @Test
    void shouldNotUpdateAppUserPasswordWithoutCredentials() {
        var appUser = new AppUser(13L, "test-user", "old-password");
        
        when(appUserRepository.findByUsername("test-user")).thenReturn(appUser);
        
        var response = mockMvc.put().uri("/appusers").contentType(MediaType.APPLICATION_JSON).content("\"new-password\"").exchange();
        
        assertThat(response).hasStatus(HttpStatus.FORBIDDEN);
    }
    
    @Test
    void shouldDeleteAppUserAndAppUsersProject() {
        var appUser = new AppUser(13L, "test-user", "password");
        when(appUserRepository.findByUsername("test-user")).thenReturn(appUser);
        
        var projects = List.of( new Project(77L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), LocalDateTime.of(2025, 1, 28, 17, 23, 19), LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat", 99L),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat", 100L)
                ),
                Set.of(new ProjectAppUser(13L))));
        when(projectRepository.findAllByUsername("test-user")).thenReturn(projects);
        
        var response = mockMvc.delete().uri("/appusers").with(jwt().jwt(jwt -> jwt.subject("test-user"))).exchange();
        
        assertThat(response).hasStatus(HttpStatus.NO_CONTENT);
        
        verify(projectRepository, times(1)).deleteById(77L);
        verify(appUserRepository, times(1)).deleteById(13L);
    }
    
    @Test
    void shouldDeleteAppUserButNotAppUsersProjectWhereIsAlsoOtherAppUsers() {
        var appUser = new AppUser(13L, "test-user", "password");
        when(appUserRepository.findByUsername("test-user")).thenReturn(appUser);
        
        var projects = List.of( new Project(77L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), LocalDateTime.of(2025, 1, 28, 17, 23, 19), LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat", 99L),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat", 100L)
                ),
                Set.of(new ProjectAppUser(13L), new ProjectAppUser(15L))));
        when(projectRepository.findAllByUsername("test-user")).thenReturn(projects);
        
        var response = mockMvc.delete().uri("/appusers").with(jwt().jwt(jwt -> jwt.subject("test-user"))).exchange();
        
        assertThat(response).hasStatus(HttpStatus.NO_CONTENT);
        
        verify(projectRepository, times(0)).deleteById(77L);
        verify(appUserRepository, times(1)).deleteById(13L);
    }
    
    @Test
    void shouldNotDeleteAppUserWithoutCredentials() {
        var appUser = new AppUser(13L, "test-user", "password");
        when(appUserRepository.findByUsername("test-user")).thenReturn(appUser);
        
        var projects = List.of( new Project(77L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), LocalDateTime.of(2025, 1, 28, 17, 23, 19), LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat", 99L),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat", 100L)
                ),
                Set.of(new ProjectAppUser(13L))));
        when(projectRepository.findAllByUsername("test-user")).thenReturn(projects);
        
        var response = mockMvc.delete().uri("/appusers").exchange();
        
        assertThat(response).hasStatus(HttpStatus.FORBIDDEN);
        
        verify(projectRepository, times(0)).deleteById(77L);
        verify(appUserRepository, times(0)).deleteById(13L);
    }
    
}