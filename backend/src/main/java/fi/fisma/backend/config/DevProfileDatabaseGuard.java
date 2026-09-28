package fi.fisma.backend.config;

import java.net.URI;
import java.util.Set;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Profiles;

/**
 * Stops the application from starting when the {@code dev} profile is active and the datasource
 * points to a non-local database.
 *
 * <p>The {@code dev} profile runs {@code database-seed-dev.sql}, which deletes every row from the
 * main tables before reseeding. {@code docker compose up} uses that profile, as does {@code
 * ./gradlew bootRun} when {@code SPRING_PROFILES_ACTIVE=dev} is set, so a testing or production URL
 * in {@code .env} would wipe that database. This check runs before any database connection is
 * opened. Registered in {@code META-INF/spring.factories}.
 */
public class DevProfileDatabaseGuard implements EnvironmentPostProcessor, Ordered {

  /** Hosts that are always a local database: this machine, or the Compose service {@code db}. */
  static final Set<String> LOCAL_HOSTS = Set.of("localhost", "127.0.0.1", "::1", "db");

  @Override
  public void postProcessEnvironment(
      ConfigurableEnvironment environment, SpringApplication application) {
    if (!environment.acceptsProfiles(Profiles.of("dev"))) {
      return;
    }

    String url = environment.getProperty("spring.datasource.url");
    String host = hostOf(url);
    if (host == null || !LOCAL_HOSTS.contains(host)) {
      throw new InvalidConfigurationException(
          "Refusing to start: the 'dev' profile deletes and reseeds the database, but"
              + " spring.datasource.url points to '"
              + host
              + "', which is not a local database.",
          "Use a local database, or run without the 'dev' profile (e.g."
              + " SPRING_PROFILES_ACTIVE=default ./gradlew bootRun).");
    }
  }

  /** Returns the lower-cased host of a {@code jdbc:} URL, or {@code null} if it can't be read. */
  static String hostOf(String jdbcUrl) {
    if (jdbcUrl == null || !jdbcUrl.startsWith("jdbc:")) {
      return null;
    }
    try {
      String host = URI.create(jdbcUrl.substring("jdbc:".length())).getHost();
      if (host == null) {
        return null;
      }
      // URI keeps the brackets around IPv6 addresses, e.g. "[::1]".
      return host.replaceAll("^\\[|\\]$", "").toLowerCase();
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  @Override
  public int getOrder() {
    // Run after application.yaml and SPRING_PROFILES_ACTIVE have been applied.
    return Ordered.LOWEST_PRECEDENCE;
  }
}
