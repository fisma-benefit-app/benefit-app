package fi.fisma.backend.config;

import java.net.URI;
import java.util.Arrays;
import org.apache.commons.logging.Log;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

/**
 * Stops startup before any bean is created when required configuration is missing, and logs one
 * line with the effective profile and database so a wrong {@code .env} value is visible at once.
 *
 * <p>Without this check, a missing {@code JWT_PRIVATE_KEY} only surfaced as about 90 lines of
 * nested bean-creation exceptions. Registered in {@code META-INF/spring.factories}.
 */
public class RequiredConfigGuard implements EnvironmentPostProcessor, Ordered {

  private final Log log;

  public RequiredConfigGuard(DeferredLogFactory logFactory) {
    this.log = logFactory.getLog(RequiredConfigGuard.class);
  }

  @Override
  public void postProcessEnvironment(
      ConfigurableEnvironment environment, SpringApplication application) {
    if (!hasValue(environment, "jwt.private.key")) {
      throw new InvalidConfigurationException(
          "JWT_PRIVATE_KEY is not set.",
          "Set JWT_PRIVATE_KEY to the key from the backend-credentials repository. docker compose"
              + " reads it from the root .env; ./gradlew bootRun and java -jar don't, so export it"
              + " first, e.g. `set -a && source ../.env && set +a`.");
    }

    String[] profiles = environment.getActiveProfiles();
    log.info(
        "Starting with profile(s) "
            + (profiles.length == 0 ? "[default]" : Arrays.toString(profiles))
            + ", database "
            + describeDatabase(environment.getProperty("spring.datasource.url")));
  }

  /** False if the property is unset, blank, or refers to an unset placeholder. */
  private static boolean hasValue(ConfigurableEnvironment environment, String key) {
    try {
      String value = environment.getProperty(key);
      return value != null && !value.isBlank();
    } catch (IllegalArgumentException unresolvablePlaceholder) {
      return false;
    }
  }

  /** Returns {@code host:port/database} of a {@code jdbc:} URL, never the credentials. */
  static String describeDatabase(String jdbcUrl) {
    if (jdbcUrl == null) {
      return "(spring.datasource.url not set)";
    }
    if (!jdbcUrl.startsWith("jdbc:")) {
      return "(unreadable spring.datasource.url)";
    }
    try {
      URI uri = URI.create(jdbcUrl.substring("jdbc:".length()));
      if (uri.getHost() == null) {
        return "(unreadable spring.datasource.url)";
      }
      return uri.getHost() + (uri.getPort() == -1 ? "" : ":" + uri.getPort()) + uri.getPath();
    } catch (IllegalArgumentException e) {
      return "(unreadable spring.datasource.url)";
    }
  }

  @Override
  public int getOrder() {
    // Run after application.yaml and SPRING_PROFILES_ACTIVE have been applied.
    return Ordered.LOWEST_PRECEDENCE;
  }
}
