package fi.fisma.backend.project;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;


@WebMvcTest(ProjectController.class)
class ProjectControllerTest {
    
    @Autowired
    MockMvcTester mockMvc;
    
    @MockitoBean
    ProjectRepository projectRepository;
    
    @BeforeEach
    void setUp() {
        Project project = new Project(77L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12, Set.of(
                new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null),
                new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null)
        ), Set.of(new ProjectAppUser(13L)));
        when(projectRepository.findById(77L)).thenReturn(Optional.of(project));
    }
    
    @Test
    void shouldReturnAProjectWithAKnowId() {
        assertThat(mockMvc.get().uri("/projects/77")).hasStatusOk();
        assertThat(mockMvc.get().uri("/projects/77")).bodyJson().extractingPath("$.id").isEqualTo(77);
        assertThat(mockMvc.get().uri("/projects/77")).bodyJson().extractingPath("$.projectName").isEqualTo("project-x");
        // TODO - assert all the remaining values
    }
    
    @Test
    void shouldNotReturnAProjectAWithAnUnknowId() {
        assertThat(mockMvc.get().uri("/projects/777")).hasStatus(HttpStatus.NOT_FOUND);
    }
    
}