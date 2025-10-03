package fi.fisma.backend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import fi.fisma.backend.setup.StandaloneSetup;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

@JsonTest
class FunctionalComponentRequestTest {

  @Autowired private JacksonTester<FunctionalComponentRequest> json;

  private FunctionalComponentRequest dto;

  @BeforeEach
  void setUp() {
    dto = new FunctionalComponentRequest();
    StandaloneSetup.createFunctionalComponentRequest(dto);
  }

  @Test
  void testSerialize() throws Exception {
    assertThat(json.write(dto))
        .hasJsonPathNumberValue("$.id")
        .extractingJsonPathNumberValue("$.id")
        .isEqualTo(1);

    assertThat(json.write(dto))
        .hasJsonPathStringValue("$.className")
        .extractingJsonPathStringValue("$.className")
        .isEqualTo("UserAccount");

    assertThat(json.write(dto))
        .hasJsonPathNumberValue("$.orderPosition")
        .extractingJsonPathNumberValue("$.orderPosition")
        .isEqualTo(1);

    assertThat(json.write(dto))
        .hasJsonPathNumberValue("$.degreeOfCompletion")
        .extractingJsonPathNumberValue("$.degreeOfCompletion")
        .isEqualTo(0.75);
  }

  @Test
  void testDeserialize() throws Exception {
    String content = json.write(dto).getJson();

    FunctionalComponentRequest dto = json.parseObject(content);

    assertThat(dto.getId()).isEqualTo(1L);
    assertThat(dto.getClassName()).isEqualTo("UserAccount");
    assertThat(dto.getOrderPosition()).isEqualTo(1);
    assertThat(dto.getDegreeOfCompletion()).isEqualTo(0.75);
    assertThat(dto.getTitle()).isEqualTo("Create User Account");
    assertThat(dto.getDescription()).isEqualTo("Handles user account creation process");
  }
}
