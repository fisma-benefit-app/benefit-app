package fi.fisma.backend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import fi.fisma.backend.setup.StandaloneSetup;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

@JsonTest
class ProjectRequestTest {

  @Autowired private JacksonTester<ProjectRequest> json;

  private ProjectRequest dto;

  @BeforeEach
  void setUp() {
    dto = new ProjectRequest();
    StandaloneSetup.createProjectRequest(dto);
  }

  @Test
  void testSerialize() throws Exception {
    assertThat(json.write(dto))
        .hasJsonPathStringValue("$.projectName")
        .extractingJsonPathStringValue("$.projectName")
        .isEqualTo("User Authentication System");

    assertThat(json.write(dto))
        .hasJsonPathNumberValue("$.version")
        .extractingJsonPathNumberValue("$.version")
        .isEqualTo(1);

    assertThat(json.write(dto)).hasJsonPathArrayValue("$.appUserIds");
  }

  @Test
  void testDeserialize() throws Exception {
    String content = json.write(dto).getJson();

    ProjectRequest dto = json.parseObject(content);

    assertThat(dto.getProjectName()).isEqualTo("User Authentication System");
    assertThat(dto.getVersion()).isEqualTo(1);
    assertThat(dto.getProjectAppUserIds()).containsExactlyInAnyOrder(10L, 20L);
  }
}
