package fi.fisma.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.security.JwtRevocationFilter;
import fi.fisma.backend.security.LoginAttemptThrottleService;
import fi.fisma.backend.security.SecurityConfig;
import fi.fisma.backend.security.TokenBlacklistService;
import fi.fisma.backend.security.UserDetailsServiceImpl;
import fi.fisma.backend.service.FunctionalComponentService;
import fi.fisma.backend.setup.StandaloneSetup;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest(FunctionalComponentController.class)
@ActiveProfiles("test")
@Import({SecurityConfig.class, UserDetailsServiceImpl.class, JwtRevocationFilter.class})
class FunctionalComponentControllerTest {

  @Autowired MockMvcTester mockMvcTester;
  @Autowired ObjectMapper objectMapper;

  @MockitoBean FunctionalComponentService functionalComponentService;
  @MockitoBean AppUserRepository appUserRepository;
  @MockitoBean TokenBlacklistService blacklistService;
  @MockitoBean LoginAttemptThrottleService loginAttemptThrottleService;

  private final JwtRequestPostProcessor jwtAuth =
      org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
          .jwt()
          .jwt(jwt -> jwt.subject("test-user"));

  @Test
  void testCreateFunctionalComponent_LargeDescription() throws Exception {
    String largeDescription = "a".repeat(5000);
    assertThat(largeDescription.getBytes(StandardCharsets.UTF_8)).hasSize(5000);

    FunctionalComponentRequest request = new FunctionalComponentRequest();
    StandaloneSetup.createFunctionalComponentRequest(request);
    request.setDescription(largeDescription);

    var response =
        mockMvcTester
            .post()
            .uri("/functional-components/projects/{projectId}", 1L)
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request))
            .exchange();

    assertThat(response).hasStatusOk();
    verify(functionalComponentService)
        .createFunctionalComponent(
            eq(1L), argThat(req -> largeDescription.equals(req.getDescription())), eq("test-user"));
  }
}
