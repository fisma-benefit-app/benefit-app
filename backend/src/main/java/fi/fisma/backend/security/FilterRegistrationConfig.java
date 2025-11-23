package fi.fisma.backend.security;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterRegistrationConfig {

  @Bean
  public FilterRegistrationBean<JwtRevocationFilter> revocationFilterRegistration(
      JwtRevocationFilter filter) {
    FilterRegistrationBean<JwtRevocationFilter> reg = new FilterRegistrationBean<>(filter);
    reg.setEnabled(false); // Prevent servlet container auto registration
    return reg;
  }
}
