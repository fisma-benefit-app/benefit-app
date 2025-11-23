package fi.fisma.backend.security;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {
  private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

  public void blacklistToken(String tokenId) {
    blacklistedTokens.add(tokenId);
  }

  public boolean isTokenBlacklisted(String tokenId) {
    return blacklistedTokens.contains(tokenId);
  }
}
