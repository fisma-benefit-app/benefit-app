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

  // Add a revoked token with its expiry
  public void blacklistToken(String jti, Instant expiresAt) {
    if (jti != null && expiresAt != null) {
      blacklistedTokens.put(jti, expiresAt);
    }
  }

  // Check if a token is currently revoked and not expired
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

  // Periodic cleanup to trim any leftovers
  @Scheduled(fixedRate = 3_600_000) // every hour
  public void cleanupExpiredTokens() {
    Instant now = Instant.now();
    blacklistedTokens.entrySet().removeIf(e -> now.isAfter(e.getValue()));
  }
}
