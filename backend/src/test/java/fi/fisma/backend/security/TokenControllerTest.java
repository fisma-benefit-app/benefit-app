package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

import fi.fisma.backend.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest({TokenController.class})
@Import({
  SecurityConfig.class,
  UserDetailsServiceImpl.class,
  JwtRevocationFilter.class,
  TokenService.class
})
class TokenControllerTest {

  @Autowired MockMvcTester mockMvc;

  @MockitoBean AppUserRepository appUserRepository;
  @MockitoBean TokenService tokenService;
  @MockitoBean TokenBlacklistService blacklistService;

  private final JwtRequestPostProcessor jwtAuth =
      org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
          .jwt()
          .jwt(jwt -> jwt.subject("test-user"));

  @Test
  void shouldGenerateTokenSuccessfully() {
    String fakeToken = "jwt-token-123";
    given(tokenService.generateToken(any(Authentication.class))).willReturn(fakeToken);

    var response = mockMvc.post().uri("/token").with(jwtAuth).exchange();

    assertThat(response).hasStatus(HttpStatus.OK);

    // Assert Authorization header
    String authHeader = response.getResponse().getHeader(HttpHeaders.AUTHORIZATION);
    assertThat(authHeader).isEqualTo("Bearer jwt-token-123");

    // Assert CORS header is present
    String exposedHeader =
        response.getResponse().getHeader(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS);
    assertThat(exposedHeader).isEqualTo("Authorization");

    // Assert claims
    assertThat(response).bodyJson().extractingPath("$.token").isEqualTo(fakeToken);
    assertThat(response).bodyJson().extractingPath("$.tokenType").isEqualTo("Bearer");
    assertThat(response).bodyJson().extractingPath("$.expiresIn").isEqualTo(86400);
  }
}
