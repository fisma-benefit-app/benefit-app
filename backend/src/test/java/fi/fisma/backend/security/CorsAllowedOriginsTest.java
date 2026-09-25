package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import fi.fisma.backend.config.InvalidConfigurationException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class CorsAllowedOriginsTest {

  @Test
  void acceptsExactOrigins() {
    var origins =
        List.of(
            "https://fisma-benefit-app.github.io",
            "http://localhost:5173",
            "http://203.0.113.10",
            "http://203.0.113.10/",
            "http://[::1]:8080");

    assertThat(SecurityConfig.validateAllowedOrigins(origins)).isEqualTo(origins);
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "https://fisma-benefit-app.github.io/benefit-app",
        "https://fisma-benefit-app.github.io/benefit-app/",
        "203.0.113.10:5173",
        "*",
        ""
      })
  void rejectsOriginsABrowserNeverSends(String origin) {
    assertThatThrownBy(
            () -> SecurityConfig.validateAllowedOrigins(List.of("http://localhost:5173", origin)))
        .isInstanceOf(InvalidConfigurationException.class)
        .hasMessageContaining("CORS_ALLOWED_ORIGINS");
  }

  @Test
  void rejectsEmptyList() {
    assertThatThrownBy(() -> SecurityConfig.validateAllowedOrigins(List.of()))
        .isInstanceOf(InvalidConfigurationException.class)
        .hasMessageContaining("CORS_ALLOWED_ORIGINS is set but empty");
  }
}
