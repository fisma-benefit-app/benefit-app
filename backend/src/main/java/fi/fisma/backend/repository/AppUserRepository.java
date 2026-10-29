package fi.fisma.backend.repository;

import fi.fisma.backend.domain.AppUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
  @Query("SELECT u FROM AppUser u WHERE u.id = :id AND u.deletedAt IS NULL")
  Optional<AppUser> findByIdActive(@Param("id") Long id);

  @Query("SELECT u FROM AppUser u WHERE u.username = :username AND u.deletedAt IS NULL")
  Optional<AppUser> findByUsernameActive(@Param("username") String username);

  /** True/false for an existing active user; empty if there is no such user. */
  @Query(
      value =
          "SELECT COALESCE(locked_until > now(), FALSE) FROM app_users"
              + " WHERE username = :username AND deleted_at IS NULL",
      nativeQuery = true)
  Optional<Boolean> isLocked(@Param("username") String username);

  /**
   * Counts one failed login. In the same statement, when the count reaches maxAttempts the account
   * is locked for lockSeconds and the count goes back to 0 (every right-hand side sees the old
   * row). Returns 0 if there is no such active user.
   */
  @Transactional
  @Modifying
  @Query(
      value =
          """
          UPDATE app_users
          SET locked_until = CASE WHEN failed_login_count + 1 >= :maxAttempts
                                  THEN now() + :lockSeconds * interval '1 second'
                                  ELSE locked_until END,
              failed_login_count = CASE WHEN failed_login_count + 1 >= :maxAttempts
                                        THEN 0
                                        ELSE failed_login_count + 1 END
          WHERE username = :username AND deleted_at IS NULL
          """,
      nativeQuery = true)
  int recordFailedLogin(
      @Param("username") String username,
      @Param("maxAttempts") int maxAttempts,
      @Param("lockSeconds") int lockSeconds);

  /** Successful login: no write at all if there is nothing to clear. */
  @Transactional
  @Modifying
  @Query(
      value =
          """
          UPDATE app_users SET failed_login_count = 0, locked_until = NULL
          WHERE username = :username AND deleted_at IS NULL
            AND (failed_login_count <> 0 OR locked_until IS NOT NULL)
          """,
      nativeQuery = true)
  int resetFailedLogins(@Param("username") String username);
}
