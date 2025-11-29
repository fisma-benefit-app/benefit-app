package fi.fisma.backend.security;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {
  // jti -> token expiry time
  private final ConcurrentMap<String, Instant> blacklistedTokens = new ConcurrentHashMap<>();

  /**
   * Adds a token's unique ID (jti) to the blacklist until its expiration time.
   *
   * @param jti the JWT ID to blacklist
   * @param expiresAt the expiration time of the token
   */
  public void blacklistToken(String jti, Instant expiresAt) {
    if (jti != null && expiresAt != null) {
      blacklistedTokens.put(jti, expiresAt);
    }
  }

  /**
   * Checks if a token is currently blacklisted and not expired. If the token is expired, it is
   * removed from the blacklist.
   *
   * @param jti the JWT ID to check
   * @return true if the token is blacklisted and not expired, false otherwise
   */
  public boolean isTokenBlacklisted(String jti) {
    if (jti == null) return false;
    Instant exp = blacklistedTokens.get(jti);
    if (exp == null) return false;

    // drop stale entries on read
    if (Instant.now().isAfter(exp)) {
      blacklistedTokens.remove(jti, exp);
      return false;
    }
    return true;
  }

  /** Periodically removes expired tokens from the blacklist. Runs every hour. */
  @Scheduled(fixedRate = 3_600_000) // every hour
  public void cleanupExpiredTokens() {
    Instant now = Instant.now();
    blacklistedTokens.entrySet().removeIf(e -> now.isAfter(e.getValue()));
  }
}
