package fi.fisma.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.fisma.backend.dto.CommentRequest;
import fi.fisma.backend.dto.CommentResponse;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.CommentRepository;
import fi.fisma.backend.repository.ProjectRepository;
import fi.fisma.backend.security.JwtRevocationFilter;
import fi.fisma.backend.security.SecurityConfig;
import fi.fisma.backend.security.TokenBlacklistService;
import fi.fisma.backend.security.UserDetailsServiceImpl;
import fi.fisma.backend.service.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@WebMvcTest(CommentController.class)
@Import({SecurityConfig.class, UserDetailsServiceImpl.class, JwtRevocationFilter.class})
class CommentControllerTest {

  @Autowired MockMvcTester mockMvcTester;
  @Autowired ObjectMapper objectMapper;

  @MockitoBean CommentService commentService;
  @MockitoBean CommentRepository commentRepository;
  @MockitoBean ProjectRepository projectRepository;
  @MockitoBean AppUserRepository appUserRepository;
  @MockitoBean TokenBlacklistService blacklistService;

  private final JwtRequestPostProcessor jwtAuth =
      org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
          .jwt()
          .jwt(jwt -> jwt.subject("test-user"));

  @Test
  void testGetComments() {
    CommentResponse response = new CommentResponse(1L, "Need more details", 7L);
    when(commentService.getComments(7L, "test-user")).thenReturn(java.util.List.of(response));

    var result = mockMvcTester.get().uri("/projects/{projectId}/comments", 7L).with(jwtAuth).exchange();

    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("$[0].id").isEqualTo(1);
  }

  @Test
  void testCreateComment() throws Exception {
    CommentRequest request = new CommentRequest();
    request.setText("Need more detail on validation");

    CommentResponse created = new CommentResponse(10L, "Need more detail on validation", 7L);
    when(commentService.createComment(eq(7L), any(CommentRequest.class), eq("test-user")))
        .thenReturn(created);

    var result =
        mockMvcTester
            .post()
            .uri("/projects/{projectId}/comments", 7L)
            .with(jwtAuth)
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                """
                {
                  "text": "Need more detail on validation"
                }
                """)
            .exchange();

    assertThat(result).hasStatus(HttpStatus.CREATED);
    assertThat(result.getResponse().getHeader("Location")).contains("/projects/7/comments/10");
  }
}
