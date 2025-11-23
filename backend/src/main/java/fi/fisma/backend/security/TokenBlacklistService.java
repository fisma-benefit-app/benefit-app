package fi.fisma.backend.security;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Service;

@Service
@EnableScheduling
public class TokenBlacklistService {
  // WARNING: This in-memory blacklist will be lost when the application restarts,
  // allowing revoked tokens to be used again until they naturally expire.
  // For production use, consider implementing persistence (e.g., using Redis or a database).
  private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

  public void blacklistToken(String tokenId) {
    blacklistedTokens.add(tokenId);
  }

  public boolean isTokenBlacklisted(String tokenId) {
    return blacklistedTokens.contains(tokenId);
  }
}
