package fi.fisma.backend.security;

public class TokenBlacklistService {
  /*
  package fi.fisma.backend.security;

  import org.springframework.stereotype.Service;
  import java.util.Set;
  import java.util.concurrent.ConcurrentHashMap;
  import java.time.Instant;

  @Service
  public class TokenBlacklistService {
      private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

      public void blacklistToken(String tokenId) {
          blacklistedTokens.add(tokenId);
      }

      public boolean isTokenBlacklisted(String tokenId) {
          return blacklistedTokens.contains(tokenId);
      }

      public void removeExpiredTokens(Instant currentTime) {
          // This would require storing token expiry times
          // For now, implement periodic cleanup based on your needs
      }
  }
   */
}

/*
// ...existing code in TokenService.java...
   import java.util.UUID;

   @Service
   @RequiredArgsConstructor
   public class TokenService {
   private final JwtEncoder encoder;

   public String generateToken(Authentication authentication) {
       Instant now = Instant.now();
       long expiry = 86400L; // 24 hours
       String jti = UUID.randomUUID().toString(); // Add unique token ID

       String scope =
           authentication.getAuthorities().stream()
               .map(GrantedAuthority::getAuthority)
               .collect(Collectors.joining(" "));
       JwtClaimsSet claims =
           JwtClaimsSet.builder()
               .issuer("self")
               .issuedAt(now)
               .expiresAt(now.plusSeconds(expiry))
               .subject(authentication.getName())
               .claim("scope", scope)
               .id(jti) // Add JWT ID
               .build();

       return this.encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
   }
   }
*/

 /*
 New filter class

  package fi.fisma.backend.security;

    import jakarta.servlet.FilterChain;
    import jakarta.servlet.ServletException;
    import jakarta.servlet.http.HttpServletRequest;
    import jakarta.servlet.http.HttpServletResponse;
    import lombok.RequiredArgsConstructor;
    import org.springframework.security.oauth2.jwt.JwtDecoder;
    import org.springframework.security.oauth2.jwt.Jwt;
    import org.springframework.stereotype.Component;
    import org.springframework.web.filter.OncePerRequestFilter;
    import java.io.IOException;

    @Component
    @RequiredArgsConstructor
    public class JwtRevocationFilter extends OncePerRequestFilter {

        private final TokenBlacklistService blacklistService;
        private final JwtDecoder jwtDecoder;

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    String jti = jwt.getId();

                    if (jti != null && blacklistService.isTokenBlacklisted(jti)) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("Token has been revoked");
                        return;
                    }
                } catch (Exception e) {
                    // Let Spring Security handle invalid tokens
                }
            }

            filterChain.doFilter(request, response);
        }
    }
  */

  /*
    New endpoint

     @RestController
  @RequiredArgsConstructor
  public class AuthController {

      private final TokenBlacklistService blacklistService;
      private final JwtDecoder jwtDecoder;

      @PostMapping("/logout")
      public ResponseEntity<String> logout(HttpServletRequest request) {
          String authHeader = request.getHeader("Authorization");

          if (authHeader != null && authHeader.startsWith("Bearer ")) {
              String token = authHeader.substring(7);

              try {
                  Jwt jwt = jwtDecoder.decode(token);
                  String jti = jwt.getId();

                  if (jti != null) {
                      blacklistService.blacklistToken(jti);
                      return ResponseEntity.ok("Logged out successfully");
                  }
              } catch (Exception e) {
                  return ResponseEntity.badRequest().body("Invalid token");
              }
          }

          return ResponseEntity.badRequest().body("No token provided");
      }
  }
     */

   /*
   // ...existing code in SecurityConfig.java...
   import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

   @Configuration
   @EnableWebSecurity
   @RequiredArgsConstructor
   public class SecurityConfig {
   private final UserDetailsServiceImpl userDetailsService;
   private final JwtRevocationFilter jwtRevocationFilter;

   @Bean
   public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
       http.authorizeHttpRequests(
               (authorize) ->
                   authorize
                       .requestMatchers(
                           "/actuator/health",
                           "/v3/api-docs",
                           "/v3/api-docs.yaml",
                           "/v3/api-docs/**",
                           "/swagger-ui.html",
                           "/swagger-ui/**",
                           "/token",
                           "/logout")
                       .permitAll()
                       .anyRequest()
                       .authenticated())
           .addFilterBefore(jwtRevocationFilter, UsernamePasswordAuthenticationFilter.class)
           // ...existing code...
       return http.build();
   }
   // ...existing code...
   }
   */
