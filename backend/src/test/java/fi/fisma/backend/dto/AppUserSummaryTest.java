package fi.fisma.backend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import fi.fisma.backend.setup.StandaloneSetup;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

@JsonTest
public class AppUserSummaryTest {

  @Autowired private JacksonTester<AppUserSummary> json;

  private AppUserSummary appUserSummary;

  @BeforeEach
  void setUp() {
    appUserSummary = StandaloneSetup.appUserSummary();
  }

  @Test
  void testSerialize() throws Exception {
    assertThat(json.write(appUserSummary))
        .hasJsonPathNumberValue("$.id")
        .extractingJsonPathNumberValue("$.id")
        .isEqualTo(1);

    assertThat(json.write(appUserSummary))
        .hasJsonPathStringValue("$.username")
        .extractingJsonPathStringValue("$.username")
        .isEqualTo("john.doe");
  }

  @Test
  void testDeserialize() throws Exception {
    String content =
        """
            {
              "id": 1,
              "username": "john.doe"
            }
            """;

    AppUserSummary appUserSummary = json.parseObject(content);

    assertThat(appUserSummary.id()).isEqualTo(1L);
    assertThat(appUserSummary.username()).isEqualTo("john.doe");
  }
}
