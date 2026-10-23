package fi.fisma.backend.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClockConfig {

  /** Timestamps are stored as Finnish local time whatever time zone the server runs in. */
  @Bean
  public Clock clock() {
    return Clock.system(ZoneId.of("Europe/Helsinki"));
  }
}
