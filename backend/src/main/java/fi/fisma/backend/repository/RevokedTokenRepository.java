package fi.fisma.backend.repository;

import fi.fisma.backend.domain.RevokedToken;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, String> {

  boolean existsByJtiAndExpiresAtAfter(String jti, Instant now);

  // An explicit bulk delete: a derived `long deleteBy...` fails at runtime (null return when
  // nothing
  // matches, ClassCastException when rows are deleted).
  @Modifying
  @Query("DELETE FROM RevokedToken t WHERE t.expiresAt <= :now")
  int deleteExpired(@Param("now") Instant now);
}
