package fi.fisma.backend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import fi.fisma.backend.setup.StandaloneSetup;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

@JsonTest
class PasswordChangeRequestTest {

  @Autowired private JacksonTester<PasswordChangeRequest> json;

  private PasswordChangeRequest dto;

  @BeforeEach
  void setUp() {
    dto = new PasswordChangeRequest();
    StandaloneSetup.createPasswordChangeRequest(dto);
  }

  @Test
  void testSerialize() throws Exception {
    assertThat(json.write(dto))
        .hasJsonPathStringValue("$.newPassword")
        .extractingJsonPathStringValue("$.newPassword")
        .isEqualTo("mySecret123");
  }

  @Test
  void testDeserialize() throws Exception {
    String content = json.write(dto).getJson();

    PasswordChangeRequest dto = json.parseObject(content);

    assertThat(dto.getNewPassword()).isEqualTo("mySecret123");
  }
}
