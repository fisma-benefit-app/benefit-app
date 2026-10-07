package fi.fisma.backend.security;

import fi.fisma.backend.domain.RevokedToken;
import fi.fisma.backend.repository.RevokedTokenRepository;
import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TokenBlacklistService {
  private final RevokedTokenRepository revokedTokenRepository;

  public TokenBlacklistService(RevokedTokenRepository revokedTokenRepository) {
    this.revokedTokenRepository = revokedTokenRepository;
  }

  /**
   * Adds a token's unique ID (jti) to the blacklist until its expiration time.
   *
   * @param jti the JWT ID to blacklist
   * @param expiresAt the expiration time of the token
   */
  @Transactional
  public void blacklistToken(String jti, Instant expiresAt) {
    if (jti != null && expiresAt != null) {
      revokedTokenRepository.save(new RevokedToken(jti, expiresAt));
    }
  }

  /**
   * Checks if a token is currently blacklisted and not expired.
   *
   * @param jti the JWT ID to check
   * @return true if the token is blacklisted and not expired, false otherwise
   */
  public boolean isTokenBlacklisted(String jti) {
    if (jti == null) {
      return false;
    }
    return revokedTokenRepository.existsByJtiAndExpiresAtAfter(jti, Instant.now());
  }

  /** Periodically removes expired tokens from the blacklist. Runs every hour. */
  @Scheduled(fixedRate = 3_600_000) // every hour
  @Transactional
  public void cleanupExpiredTokens() {
    revokedTokenRepository.deleteByExpiresAtLessThanEqual(Instant.now());
  }
}
