package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;

import fi.fisma.backend.repository.RevokedTokenRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class TokenBlacklistServiceCleanupTest {

  @Autowired private TokenBlacklistService tokenBlacklistService;
  @Autowired private RevokedTokenRepository revokedTokenRepository;
  @Autowired private JdbcTemplate jdbcTemplate;

  private String expiredJti;
  private String activeJti;

  @BeforeEach
  void createTable() {
    jdbcTemplate.execute(
        "CREATE TABLE IF NOT EXISTS revoked_tokens ("
            + "jti VARCHAR PRIMARY KEY, "
            + "expires_at TIMESTAMP WITH TIME ZONE NOT NULL)");
    expiredJti = "expired-" + UUID.randomUUID();
    activeJti = "active-" + UUID.randomUUID();
  }

  @AfterEach
  void cleanUp() {
    revokedTokenRepository.deleteById(expiredJti);
    revokedTokenRepository.deleteById(activeJti);
  }

  @Test
  void cleanupExpiredTokensRemovesOnlyExpiredTokens() {
    tokenBlacklistService.blacklistToken(expiredJti, Instant.now().minus(1, ChronoUnit.HOURS));
    tokenBlacklistService.blacklistToken(activeJti, Instant.now().plus(1, ChronoUnit.HOURS));

    tokenBlacklistService.cleanupExpiredTokens();

    assertThat(revokedTokenRepository.findById(expiredJti)).isEmpty();
    assertThat(revokedTokenRepository.findById(activeJti)).isPresent();
  }
}
