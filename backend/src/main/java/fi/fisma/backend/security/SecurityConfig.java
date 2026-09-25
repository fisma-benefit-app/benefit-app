package fi.fisma.backend.security;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import fi.fisma.backend.config.InvalidConfigurationException;
import jakarta.servlet.http.HttpServletResponse;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
  private final UserDetailsServiceImpl userDetailsService;
  private final LoginAttemptThrottleService loginAttemptThrottleService;

  @Value("${jwt.public.key}")
  RSAPublicKey key;

  @Bean
  public RSAPrivateKey privateKey(@Value("${jwt.private.key}") String privateKey) {
    try {
      return parsePrivateKey(privateKey);
    } catch (Exception exception) {
      throw new InvalidConfigurationException(
          "JWT_PRIVATE_KEY is not a valid RSA private key (" + exception + ").",
          "Copy the whole PKCS#8 PEM (-----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----)"
              + " from the backend-credentials repository, quoted, with its line breaks.",
          exception);
    }
  }

  @Bean
  public SecurityFilterChain securityFilterChain(
      HttpSecurity http, JwtRevocationFilter jwtRevocationFilter) throws Exception {

    http.csrf((csrf) -> csrf.ignoringRequestMatchers("/token", "/auth/logout"))
        .addFilterBefore(jwtRevocationFilter, SecurityContextHolderFilter.class)
        .authorizeHttpRequests(
            (authorize) ->
                authorize
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(
                        "/actuator/health",
                        "/v3/api-docs",
                        "/v3/api-docs.yaml",
                        "/v3/api-docs/**",
                        "/swagger-ui.html",
                        "/swagger-ui/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .cors(Customizer.withDefaults())
        .httpBasic(
            basic ->
                basic.authenticationEntryPoint(
                    (request, response, exception) -> {
                      if (isLockedException(exception)) {
                        response.setStatus(429);
                        response.setContentType("application/json");
                        response
                            .getWriter()
                            .write(
                                "{\"error\":\"Too many failed login attempts. Please try again later.\"}");
                        return;
                      }
                      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                      response.setContentType("application/json");
                      response.getWriter().write("{\"error\":\"Unauthorized\"}");
                    }))
        .oauth2ResourceServer((oauth2) -> oauth2.jwt(Customizer.withDefaults()))
        .sessionManagement(
            (session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(
            (exceptions) -> exceptions.accessDeniedHandler(new BearerTokenAccessDeniedHandler()));
    // @formatter:on
    return http.build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
    var authProvider =
        new DaoAuthenticationProvider(userDetailsService) {
          @Override
          protected void additionalAuthenticationChecks(
              org.springframework.security.core.userdetails.UserDetails userDetails,
              UsernamePasswordAuthenticationToken authentication) {
            try {
              super.additionalAuthenticationChecks(userDetails, authentication);
              loginAttemptThrottleService.reset(userDetails.getUsername());
            } catch (BadCredentialsException exception) {
              if (loginAttemptThrottleService.recordFailure(userDetails.getUsername())) {
                throw new LockedException(
                    "Too many failed login attempts for user "
                        + userDetails.getUsername()
                        + ". Please try again later.",
                    exception);
              }
              throw exception;
            }
          }
        };
    authProvider.setPasswordEncoder(passwordEncoder());
    authProvider.setHideUserNotFoundExceptions(false);
    return authProvider;
  }

  @Bean
  JwtDecoder jwtDecoder() {
    return NimbusJwtDecoder.withPublicKey(this.key).build();
  }

  @Bean
  JwtEncoder jwtEncoder(RSAPrivateKey privateKey) {
    JWK jwk = new RSAKey.Builder(this.key).privateKey(privateKey).build();
    JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
    return new NimbusJwtEncoder(jwks);
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(
        List.of("https://fisma-benefit-app.github.io", "http://localhost:5173"));
    configuration.setAllowedMethods(
        Arrays.asList(
            HttpMethod.GET.name(),
            HttpMethod.POST.name(),
            HttpMethod.PUT.name(),
            HttpMethod.DELETE.name(),
            HttpMethod.OPTIONS.name()));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setExposedHeaders(List.of("Location", "Authorization"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  private boolean isLockedException(Exception exception) {
    Throwable current = exception;
    while (current != null) {
      if (current instanceof org.springframework.security.authentication.LockedException) {
        return true;
      }
      current = current.getCause();
    }
    return false;
  }

  private RSAPrivateKey parsePrivateKey(String privateKeyStr) throws Exception {
    String privateKeyPEM =
        privateKeyStr
            .replace("\\n", "\n")
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replaceAll("\\s+", "");

    byte[] decodedKey = Base64.getDecoder().decode(privateKeyPEM);
    PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decodedKey);
    KeyFactory keyFactory = KeyFactory.getInstance("RSA");

    return (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
  }
}
