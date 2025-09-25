package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.fisma.backend.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest({TokenController.class})
@Import({SecurityConfig.class, UserDetailsServiceImpl.class, TokenService.class})
class TokenControllerTest {

  @Autowired MockMvcTester mockMvc;

  @MockitoBean AppUserRepository appUserRepository;
  @MockitoBean TokenService tokenService;

  private final JwtRequestPostProcessor jwtAuth =
      org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
          .jwt()
          .jwt(jwt -> jwt.subject("test-user"));

  @Test
  void testGetToken() {
    when(tokenService.generateToken(any())).thenReturn("mocked-jwt");

    var response = mockMvc.post().uri("/token").with(jwtAuth).exchange();

    assertThat(response).hasStatus(HttpStatus.OK);

    // Assert Authorization header
    String authHeader = response.getResponse().getHeader(HttpHeaders.AUTHORIZATION);
    assertThat(authHeader).isEqualTo("Bearer mocked-jwt");

    // Assert CORS header is present
    String exposedHeader =
        response.getResponse().getHeader(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS);
    assertThat(exposedHeader).isEqualTo("Authorization");

    verify(tokenService).generateToken(any());
  }

  /*

  @Test
  void shouldGetTokenWithCorrectCredentials() {
    var appUser =
        new AppUser(
            13L, "test-user", "$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue");
    when(appUserRepository.findByUsername("test-user")).thenReturn(appUser);

    var project =
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
                    "Kommentti",
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
                    "Kommentti",
                    100L,
                    0)),
            Set.of(new ProjectAppUser(13L)));
    when(projectRepository.findByProjectIdAndUsername(77L, "test-user"))
        .thenReturn(Optional.of(project));

    var tokenResponse =
        mockMvc.post().uri("/token").with(httpBasic("test-user", "user")).exchange();

    assertThat(tokenResponse).hasStatusOk();

    var token = tokenResponse.getResponse().getHeader("Authorization");

    assertThat(token).isNotNull();

    var jwt = token.replaceFirst("Bearer ", "");

    var response =
        mockMvc.get().uri("/projects/77").header("Authorization", "Bearer " + jwt).exchange();

    assertThat(response).hasStatusOk();
  }

  @Test
  void shouldNotGetTokenWithIncorrectCredentials() {
    var appUser =
        new AppUser(
            13L, "test-user", "$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue");
    when(appUserRepository.findByUsername("test-user")).thenReturn(appUser);

    assertThat(mockMvc.post().uri("/token").with(httpBasic("test-user", "wrong-password")))
        .hasStatus(HttpStatus.UNAUTHORIZED);
  }

  */

}
