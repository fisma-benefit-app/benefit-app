package fi.fisma.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.security.SecurityConfig;
import fi.fisma.backend.security.UserDetailsServiceImpl;
import fi.fisma.backend.service.AppUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest(AppUserController.class)
@Import({SecurityConfig.class, UserDetailsServiceImpl.class})
class AppUserControllerTest {

  @Autowired MockMvcTester mockMvc;

  @MockitoBean AppUserService appUserService;
  @MockitoBean AppUserRepository appUserRepository;

  @Test
  void shouldUpdateAppUserPassword() {
    doNothing().when(appUserService).changePassword(eq("new-password"), any(Authentication.class));

    var response =
        mockMvc
            .put()
            .uri("/appusers")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .contentType(MediaType.TEXT_PLAIN)
            .content("new-password")
            .exchange();

    assertThat(response).hasStatus(HttpStatus.OK);

    verify(appUserService).changePassword(eq("new-password"), any(Authentication.class));
  }

  @Test
  void shouldNotUpdateAppUserPasswordWithoutCredentials() {
    // no .with(jwt(...)) here → unauthenticated

    var response =
        mockMvc
            .put()
            .uri("/appusers")
            .contentType(MediaType.TEXT_PLAIN)
            .content("new-password")
            .exchange();

    assertThat(response).hasStatus(HttpStatus.FORBIDDEN);

    verifyNoInteractions(appUserService);
  }

  @Test
  void shouldDeleteAppUser() {
    doNothing().when(appUserService).deleteAppUser(any(Authentication.class));

    var response =
        mockMvc
            .delete()
            .uri("/appusers")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .exchange();

    assertThat(response).hasStatus(HttpStatus.NO_CONTENT);
    verify(appUserService).deleteAppUser(any(Authentication.class));
  }

  @Test
  void shouldDeleteAppUserWithoutDeletingProjectsForOtherUsers() {
    doNothing().when(appUserService).deleteAppUser(any(Authentication.class));

    var response =
        mockMvc
            .delete()
            .uri("/appusers")
            .with(jwt().jwt(jwt -> jwt.subject("test-user")))
            .exchange();

    assertThat(response).hasStatus(HttpStatus.NO_CONTENT);

    verify(appUserService).deleteAppUser(any(Authentication.class));
  }

  @Test
  void shouldNotDeleteAppUserWithoutCredentials() {
    // no .with(jwt(...)) here → unauthenticated

    var response = mockMvc.delete().uri("/appusers").exchange();

    assertThat(response).hasStatus(HttpStatus.FORBIDDEN);

    verifyNoInteractions(appUserService);
  }
}
