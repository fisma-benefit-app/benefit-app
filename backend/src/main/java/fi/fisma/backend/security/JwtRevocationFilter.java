package fi.fisma.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtRevocationFilter extends OncePerRequestFilter {

  private final TokenBlacklistService blacklistService;
  private final JwtDecoder jwtDecoder;
  private final BearerTokenResolver bearerTokenResolver;

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {

    try {
      String token = bearerTokenResolver.resolve(request);
      if (token != null) {
        Jwt jwt = jwtDecoder.decode(token);
        String jti = jwt.getId();

        if (jti == null || blacklistService.isTokenBlacklisted(jti)) {
          response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
          response.setContentType("application/json");
          response.getWriter().write("{\"error\": \"Token has been revoked\"}");
          return;
        }
      }
    } catch (JwtException | OAuth2AuthenticationException e) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.setContentType("application/json");
      response.getWriter().write("{\"error\":\"Invalid token\"}");
      return;
    }

    filterChain.doFilter(request, response);
  }
}
