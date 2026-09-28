package fi.fisma.backend.config;

/**
 * Thrown when required deployment configuration is missing or wrong. {@link
 * InvalidConfigurationFailureAnalyzer} turns it into a short "APPLICATION FAILED TO START" report
 * instead of a full stack trace, so the fix is the first thing someone setting up an environment
 * sees.
 */
public class InvalidConfigurationException extends IllegalStateException {

  private final String description;
  private final String action;

  /**
   * @param description what is wrong, e.g. which variable is missing
   * @param action what to do about it
   */
  public InvalidConfigurationException(String description, String action) {
    this(description, action, null);
  }

  public InvalidConfigurationException(String description, String action, Throwable cause) {
    super(description + " " + action, cause);
    this.description = description;
    this.action = action;
  }

  public String getDescription() {
    return description;
  }

  public String getAction() {
    return action;
  }
}
