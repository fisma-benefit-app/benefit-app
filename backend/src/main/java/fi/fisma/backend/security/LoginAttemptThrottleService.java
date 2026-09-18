package fi.fisma.backend.security;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptThrottleService {
  private static final int MAX_ATTEMPTS = 5;
  private static final long WINDOW_SECONDS = 60; // 300

  private final Map<String, LoginAttemptRecord> attempts = new ConcurrentHashMap<>();

  public boolean isBlocked(String username) {
    var record = attempts.get(username);
    if (record == null) {
      return false;
    }

    if (record.lastAttemptAt().isBefore(Instant.now().minusSeconds(WINDOW_SECONDS))) {
      attempts.remove(username);
      return false;
    }

    return record.count() >= MAX_ATTEMPTS;
  }

  public boolean recordFailure(String username) {
    var now = Instant.now();
    var existing = attempts.getOrDefault(username, new LoginAttemptRecord(0, now));

    var updatedCount = existing.count() + 1;
    attempts.put(username, new LoginAttemptRecord(updatedCount, now));
    return updatedCount >= MAX_ATTEMPTS;
  }

  public void reset(String username) {
    attempts.remove(username);
  }

  private record LoginAttemptRecord(int count, Instant lastAttemptAt) {}
}
