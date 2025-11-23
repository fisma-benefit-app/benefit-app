package fi.fisma.backend.security;

import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@EnableScheduling
public class TokenBlacklistService {
  // Map from tokenId to expiration time (epoch millis)
  private final ConcurrentHashMap<String, Long> blacklistedTokens = new ConcurrentHashMap<>();

  /**
   * Blacklist a token until its expiration time.
   *
   * @param tokenId the token ID
   * @param expirationTimeMillis the expiration time in epoch milliseconds
   */
  public void blacklistToken(String tokenId, long expirationTimeMillis) {
    blacklistedTokens.put(tokenId, expirationTimeMillis);
  }

  public boolean isTokenBlacklisted(String tokenId) {
    Long expiration = blacklistedTokens.get(tokenId);
    if (expiration == null) {
      return false;
    }
    if (System.currentTimeMillis() > expiration) {
      // Token expired, remove from blacklist
      blacklistedTokens.remove(tokenId);
      return false;
    }
    return true;
  }

  /** Periodically clean up expired tokens from the blacklist. Runs every hour. */
  @Scheduled(fixedRate = 60 * 60 * 1000) // every hour
  public void cleanupExpiredTokens() {
    long now = System.currentTimeMillis();
    Iterator<String> it = blacklistedTokens.keySet().iterator();
    while (it.hasNext()) {
      String tokenId = it.next();
      Long expiration = blacklistedTokens.get(tokenId);
      if (expiration != null && now > expiration) {
        it.remove();
      }
    }
  }
}
