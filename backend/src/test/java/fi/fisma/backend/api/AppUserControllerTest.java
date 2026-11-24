package fi.fisma.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.domain.EnumUserRole;
import fi.fisma.backend.dto.AppUserRequest;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.security.JwtRevocationFilter;
import fi.fisma.backend.security.LoginAttemptThrottleService;
import fi.fisma.backend.security.SecurityConfig;
import fi.fisma.backend.security.TokenBlacklistService;
import fi.fisma.backend.security.UserDetailsServiceImpl;
import fi.fisma.backend.service.AppUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest(AppUserController.class)
@ActiveProfiles("test")
@Import({SecurityConfig.class, UserDetailsServiceImpl.class, JwtRevocationFilter.class})
class AppUserControllerTest {

  @Autowired MockMvcTester mockMvcTester;

  @MockitoBean AppUserService appUserService;
  @MockitoBean AppUserRepository appUserRepository;
  @MockitoBean TokenBlacklistService blacklistService;
  @MockitoBean LoginAttemptThrottleService loginAttemptThrottleService;

  private final JwtRequestPostProcessor jwtAuth =
      org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
          .jwt()
          .jwt(jwt -> jwt.subject("test-user"));

  @Test
  void createUserEndpointReturnsCreatedUserSummary() {
    when(appUserService.createNewAppUser(any(AppUserRequest.class), any(Authentication.class)))
        .thenReturn(new AppUser(10L, "new-admin", "encoded-password", EnumUserRole.ADMIN, null, 0));

    var response =
        mockMvcTester
            .post()
            .uri("/appusers")
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "username": "new-admin",
                  "password": "newPass123",
                  "role": "ADMIN"
                }
                """)
            .exchange();

    assertThat(response).hasStatus(HttpStatus.CREATED);
    assertThat(response).bodyJson().extractingPath("$.id").isEqualTo(10);
    assertThat(response).bodyJson().extractingPath("$.username").isEqualTo("new-admin");
    verify(appUserService)
        .createNewAppUser(
            argThat(request -> request.getRole() == EnumUserRole.ADMIN), any(Authentication.class));
  }

  @Test
  void testDeleteAppUser() {
    doNothing().when(appUserService).deleteAppUser(any(Long.class), any(Authentication.class));

    var response = mockMvcTester.delete().uri("/appusers/1").with(jwtAuth).exchange();

    assertThat(response).hasStatus(HttpStatus.NO_CONTENT);
    verify(appUserService).deleteAppUser(eq(1L), any(Authentication.class));
  }

  @ParameterizedTest
  @NullSource
  @ValueSource(
      strings = {
        "",
        "1234567",
        "        ",
        "\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003",
        "aaaaaaa\0",
        "aaaaaaaa\n",
        "aaaaaaaa\r",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "ääääääääääääääääääääääääääääääääääääa"
      })
  void createUserRejectsInvalidPassword(String invalidPassword) {
    String passwordJson =
        invalidPassword == null
            ? "null"
            : "\""
                + invalidPassword
                    .replace("\\", "\\\\")
                    .replace("\0", "\\u0000")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                + "\"";

    var response =
        mockMvcTester
            .post()
            .uri("/appusers")
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "username": "new-user",
                  "password": %s,
                  "role": "USER"
                }
                """
                    .formatted(passwordJson))
            .exchange();

    assertThat(response).hasStatus(HttpStatus.BAD_REQUEST);
    verifyNoInteractions(appUserService);
  }
}
