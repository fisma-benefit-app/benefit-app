package fi.fisma.backend.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.io.support.SpringFactoriesLoader;
import org.springframework.mock.env.MockEnvironment;

class DevProfileDatabaseGuardTest {

  private final DevProfileDatabaseGuard guard = new DevProfileDatabaseGuard();
  private final SpringApplication application = new SpringApplication();

  private MockEnvironment environment(String profile, String datasourceUrl) {
    var environment = new MockEnvironment();
    environment.setActiveProfiles(profile);
    if (datasourceUrl != null) {
      environment.setProperty("spring.datasource.url", datasourceUrl);
    }
    return environment;
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "jdbc:postgresql://localhost:5433/fisma_db",
        "jdbc:postgresql://LOCALHOST:5433/fisma_db",
        "jdbc:postgresql://127.0.0.1:5433/fisma_db",
        "jdbc:postgresql://[::1]:5433/fisma_db",
        "jdbc:postgresql://db:5432/fisma_db"
      })
  void devProfileWithLocalDatabaseStarts(String url) {
    assertThatNoException()
        .isThrownBy(() -> guard.postProcessEnvironment(environment("dev", url), application));
  }

  @Test
  void devProfileWithRemoteDatabaseIsRefused() {
    var environment =
        environment(
            "dev", "jdbc:postgresql://ec2-1-2-3-4.eu-west-1.compute.amazonaws.com:5432/d8x");

    assertThatThrownBy(() -> guard.postProcessEnvironment(environment, application))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("ec2-1-2-3-4.eu-west-1.compute.amazonaws.com")
        .hasMessageContaining("SPRING_PROFILES_ACTIVE=default");
  }

  @ParameterizedTest
  @ValueSource(strings = {"not-a-jdbc-url", "jdbc:postgresql:fisma_db"})
  void devProfileWithUnreadableUrlIsRefused(String url) {
    assertThatThrownBy(() -> guard.postProcessEnvironment(environment("dev", url), application))
        .isInstanceOf(IllegalStateException.class);
  }

  @Test
  void devProfileWithoutUrlIsRefused() {
    assertThatThrownBy(() -> guard.postProcessEnvironment(environment("dev", null), application))
        .isInstanceOf(IllegalStateException.class);
  }

  @ParameterizedTest
  @ValueSource(strings = {"default", "test"})
  void otherProfilesMayUseRemoteDatabase(String profile) {
    var environment =
        environment(profile, "jdbc:postgresql://ec2-1-2-3-4.compute.amazonaws.com:5432/d8x");

    assertThatNoException()
        .isThrownBy(() -> guard.postProcessEnvironment(environment, application));
  }

  @Test
  void guardIsRegisteredWithSpringBoot() {
    // Skip Spring Boot's own post-processors that need constructor arguments.
    var skipUnloadable = SpringFactoriesLoader.FailureHandler.handleMessage((message, e) -> {});
    var registered =
        SpringFactoriesLoader.forDefaultResourceLocation()
            .load(EnvironmentPostProcessor.class, skipUnloadable);

    assertThat(registered).hasAtLeastOneElementOfType(DevProfileDatabaseGuard.class);
  }
}
