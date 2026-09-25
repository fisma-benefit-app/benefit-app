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
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

  private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

  /** An origin as browsers send it: scheme, host and optional port, with no path. */
  private static final Pattern ORIGIN = Pattern.compile("https?://[^/\\s]+");

  @Value("${jwt.public.key}")
  RSAPublicKey key;

  @Value("${cors.allowed-origins}")
  List<String> allowedOrigins;

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
    configuration.setAllowedOrigins(validateAllowedOrigins(allowedOrigins));
    log.info("CORS allowed origins: {}", allowedOrigins);
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

  /**
   * Rejects origins that could never match a browser's {@code Origin} header, such as {@code
   * http://1.2.3.4/} with a trailing slash. Those would otherwise start fine and then fail every
   * request with a CORS error in the browser only.
   */
  static List<String> validateAllowedOrigins(List<String> origins) {
    List<String> invalid =
        origins.stream().filter(origin -> !ORIGIN.matcher(origin).matches()).toList();
    if (origins.isEmpty() || !invalid.isEmpty()) {
      throw new InvalidConfigurationException(
          "CORS_ALLOWED_ORIGINS contains invalid origins: " + invalid + ".",
          "Set CORS_ALLOWED_ORIGINS to a comma-separated list of the exact origins the frontend is"
              + " opened from: scheme, host and port, with no path or trailing slash, e.g."
              + " http://203.0.113.10,http://localhost:5173. '*' isn't allowed because requests"
              + " carry credentials.");
    }
    return origins;
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
