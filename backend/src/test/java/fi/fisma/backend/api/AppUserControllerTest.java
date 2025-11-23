package fi.fisma.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.security.JwtRevocationFilter;
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
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest(AppUserController.class)
@Import({SecurityConfig.class, UserDetailsServiceImpl.class, JwtRevocationFilter.class})
class AppUserControllerTest {

  @Autowired MockMvcTester mockMvcTester;

  @MockitoBean AppUserService appUserService;
  @MockitoBean AppUserRepository appUserRepository;

  private final JwtRequestPostProcessor jwtAuth =
      org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
          .jwt()
          .jwt(jwt -> jwt.subject("test-user"));

  @Test
  void testChangePassword() {
    doNothing().when(appUserService).changePassword(eq("new-password"), any(Authentication.class));

    mockMvcTester
        .put()
        .uri("/appusers/password")
        .with(jwtAuth)
        .contentType(MediaType.APPLICATION_JSON)
        .content(
            """
                {
                  "newPassword": "newPass123"
                }
                """)
        .assertThat()
        .hasStatusOk();

    verify(appUserService).changePassword(eq("newPass123"), any(Authentication.class));
  }

  @Test
  void testDeleteAppUser() {
    doNothing().when(appUserService).deleteAppUser(any(Long.class), any(Authentication.class));

    var response = mockMvcTester.delete().uri("/appusers/1").with(jwtAuth).exchange();

    assertThat(response).hasStatus(HttpStatus.NO_CONTENT);
    verify(appUserService).deleteAppUser(eq(1L), any(Authentication.class));
  }
}
