package fi.fisma.backend.security;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/** Checks durable account state on every JWT authentication, including token renewal. */
@RequiredArgsConstructor
public class AccountSessionValidator implements OAuth2TokenValidator<Jwt> {
  public static final String SESSION_VERSION_CLAIM = "session_version";
  private final AppUserRepository appUserRepository;

  @Override
  public OAuth2TokenValidatorResult validate(Jwt token) {
    if (token.getSubject() != null
        && appUserRepository
            .findByUsernameActive(token.getSubject())
            .filter(user -> matches(token, user))
            .isPresent()) {
      return OAuth2TokenValidatorResult.success();
    }
    return OAuth2TokenValidatorResult.failure(
        new OAuth2Error("invalid_token", "Account session is no longer valid", null));
  }

  public static boolean matches(Jwt token, AppUser user) {
    // Pre-migration tokens belong to version zero; a password change invalidates them too.
    if (!token.getClaims().containsKey(SESSION_VERSION_CLAIM)) {
      return user.getSessionVersion() == 0;
    }
    Object version = token.getClaims().get(SESSION_VERSION_CLAIM);
    return (version instanceof Long || version instanceof Integer)
        && ((Number) version).longValue() >= 0
        && ((Number) version).longValue() == user.getSessionVersion();
  }
}
