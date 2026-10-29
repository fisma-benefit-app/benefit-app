package fi.fisma.backend.security;

import fi.fisma.backend.repository.AppUserRepository;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Locks an account for {@link #LOCK_SECONDS} after {@link #MAX_ATTEMPTS} failed logins. For real
 * users the counter and the lock live in the database (app_users.failed_login_count and
 * locked_until), so they survive a restart. Usernames that don't exist have no row, so they are
 * still throttled in memory; that keeps "unknown user" and "wrong password" indistinguishable.
 */
@Service
@RequiredArgsConstructor
public class LoginAttemptThrottleService {
  static final int MAX_ATTEMPTS = 5;
  static final int LOCK_SECONDS = 60;

  private final AppUserRepository appUserRepository;

  private final Map<String, LoginAttemptRecord> unknownUserAttempts = new ConcurrentHashMap<>();

  public boolean isBlocked(String username) {
    return appUserRepository.isLocked(username).orElseGet(() -> isUnknownUserBlocked(username));
  }

  /** Returns true if this failure locked the account. */
  public boolean recordFailure(String username) {
    if (appUserRepository.recordFailedLogin(username, MAX_ATTEMPTS, LOCK_SECONDS) > 0) {
      return appUserRepository.isLocked(username).orElse(false);
    }
    return recordUnknownUserFailure(username);
  }

  public void reset(String username) {
    appUserRepository.resetFailedLogins(username);
    unknownUserAttempts.remove(username);
  }

  private boolean isUnknownUserBlocked(String username) {
    var record = unknownUserAttempts.get(username);
    if (record == null) {
      return false;
    }
    if (record.lastAttemptAt().isBefore(Instant.now().minusSeconds(LOCK_SECONDS))) {
      unknownUserAttempts.remove(username);
      return false;
    }
    return record.count() >= MAX_ATTEMPTS;
  }

  private boolean recordUnknownUserFailure(String username) {
    var now = Instant.now();
    var existing = unknownUserAttempts.getOrDefault(username, new LoginAttemptRecord(0, now));
    var updatedCount = existing.count() + 1;
    unknownUserAttempts.put(username, new LoginAttemptRecord(updatedCount, now));
    return updatedCount >= MAX_ATTEMPTS;
  }

  private record LoginAttemptRecord(int count, Instant lastAttemptAt) {}
}
