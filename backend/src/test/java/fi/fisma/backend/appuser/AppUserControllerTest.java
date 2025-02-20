package fi.fisma.backend.appuser;

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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

@WebMvcTest(AppUserController.class)
@Import({SecurityConfig.class, UserDetailsServiceImpl.class})
class AppUserControllerTest {
    
    @Autowired
    MockMvcTester mockMvc;
    
    @MockitoBean
    AppUserRepository appUserRepository;
    
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
    
    
    
    
}