package fi.fisma.backend.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.function.Supplier;
import org.apache.commons.logging.Log;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.BeanCreationException;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

class RequiredConfigGuardTest {

  private final RequiredConfigGuard guard = new RequiredConfigGuard(Supplier<Log>::get);
  private final SpringApplication application = new SpringApplication();

  @Test
  void startsWhenJwtPrivateKeyIsSet() {
    var environment = new MockEnvironment().withProperty("jwt.private.key", "some-key");

    assertThatNoException()
        .isThrownBy(() -> guard.postProcessEnvironment(environment, application));
  }

  @ParameterizedTest
  @ValueSource(strings = {"", "   "})
  void refusesBlankJwtPrivateKey(String value) {
    var environment = new MockEnvironment().withProperty("jwt.private.key", value);

    assertThatThrownBy(() -> guard.postProcessEnvironment(environment, application))
        .isInstanceOf(InvalidConfigurationException.class)
        .hasMessageContaining("JWT_PRIVATE_KEY is not set");
  }

  @Test
  void refusesJwtPrivateKeyPlaceholderWithoutValue() {
    // application.yaml has jwt.private.key: ${JWT_PRIVATE_KEY}; unset, it can't be resolved.
    var environment = new MockEnvironment().withProperty("jwt.private.key", "${JWT_PRIVATE_KEY}");

    assertThatThrownBy(() -> guard.postProcessEnvironment(environment, application))
        .isInstanceOf(InvalidConfigurationException.class)
        .hasMessageContaining("JWT_PRIVATE_KEY is not set");
  }

  @ParameterizedTest
  @CsvSource(
      delimiter = '|',
      value = {
        "jdbc:postgresql://db:5432/fisma_db | db:5432/fisma_db",
        "jdbc:postgresql://user:secret@db:5432/fisma_db?password=x | db:5432/fisma_db",
        "jdbc:postgresql://localhost/fisma_db | localhost/fisma_db",
        "not-a-jdbc-url | (unreadable spring.datasource.url)",
        "jdbc:postgresql:fisma_db | (unreadable spring.datasource.url)"
      })
  void describesDatabaseWithoutCredentials(String url, String expected) {
    assertThat(RequiredConfigGuard.describeDatabase(url)).isEqualTo(expected);
  }

  @Test
  void failureAnalyzerFindsTheCauseInsideBeanCreationErrors() {
    var cause = new InvalidConfigurationException("What is wrong.", "How to fix it.");
    var failure = new BeanCreationException("privateKey", "wrapped", cause);

    var analysis = new InvalidConfigurationFailureAnalyzer().analyze(failure);

    assertThat(analysis.getDescription()).isEqualTo("What is wrong.");
    assertThat(analysis.getAction()).isEqualTo("How to fix it.");
  }
}
