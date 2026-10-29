package fi.fisma.backend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import fi.fisma.backend.setup.StandaloneSetup;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FunctionalComponentRequestTest {

  private static final Validator validator =
      Validation.buildDefaultValidatorFactory().getValidator();

  private FunctionalComponentRequest dto;

  @BeforeEach
  void setUp() {
    dto = new FunctionalComponentRequest();
    StandaloneSetup.createFunctionalComponentRequest(dto);
  }

  @Test
  void testDescriptionOfMaxLengthIsValid() {
    dto.setDescription("a".repeat(10000));

    assertThat(validator.validateProperty(dto, "description")).isEmpty();
  }

  @Test
  void testDescriptionOverMaxLengthIsInvalid() {
    dto.setDescription("a".repeat(10001));

    assertThat(validator.validateProperty(dto, "description"))
        .singleElement()
        .extracting(violation -> violation.getMessage())
        .isEqualTo("Description cannot exceed 10000 characters");
  }
}
