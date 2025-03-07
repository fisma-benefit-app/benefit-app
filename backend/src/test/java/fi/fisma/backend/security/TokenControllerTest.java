package fi.fisma.backend.security;

import fi.fisma.backend.appuser.AppUser;
import fi.fisma.backend.appuser.AppUserRepository;
import fi.fisma.backend.project.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.assertj.core.api.Assertions.assertThat;

@WebMvcTest({TokenController.class, ProjectController.class})
@Import({SecurityConfig.class, UserDetailsServiceImpl.class, TokenService.class})
class TokenControllerTest {
    
    @Autowired
    MockMvcTester mockMvc;
    
    @MockitoBean
    AppUserRepository appUserRepository;
    
    @MockitoBean
    ProjectRepository projectRepository;
    
    @Test
    void shouldGetTokenWithCorrectCredentials() {
        var appUser = new AppUser(13L, "test-user", "$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue");
        when(appUserRepository.findByUsername("test-user")).thenReturn(appUser);
        
        var project = new Project(77L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12,
                Set.of(
                        new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.34, "hakijan valinnat"),
                        new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.34, "hakijan valinnat")
                ),
                Set.of(new ProjectAppUser(13L)));
        when(projectRepository.findByProjectIdAndUsername(77L, "test-user")).thenReturn(Optional.of(project));
        
        var tokenResponse = mockMvc.post().uri("/token").with(httpBasic("test-user", "user")).exchange();
        
        assertThat(tokenResponse).hasStatusOk();
        
        var token = tokenResponse.getResponse().getHeader("Authorization");
        
        assertThat(token).isNotNull();
        
        var jwt = token.replaceFirst("Bearer ", "");
        
        var response = mockMvc.get().uri("/projects/77").header("Authorization", "Bearer " + jwt).exchange();
        
        assertThat(response).hasStatusOk();
        
    }
    
    @Test
    void shouldNotGetTokenWithIncorrectCredentials() {
        var appUser = new AppUser(13L, "test-user", "$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue");
        when(appUserRepository.findByUsername("test-user")).thenReturn(appUser);
        
        assertThat(mockMvc.post().uri("/token").with(httpBasic("test-user", "wrong-password"))).hasStatus(HttpStatus.UNAUTHORIZED);
    }
    
    
}