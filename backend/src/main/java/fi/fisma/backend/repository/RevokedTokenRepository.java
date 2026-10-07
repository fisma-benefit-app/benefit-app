package fi.fisma.backend.repository;

import fi.fisma.backend.domain.RevokedToken;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, String> {

  boolean existsByJtiAndExpiresAtAfter(String jti, Instant now);

  long deleteByExpiresAtLessThanEqual(Instant now);
}
