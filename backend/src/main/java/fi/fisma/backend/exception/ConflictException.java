package fi.fisma.backend.exception;

public class ConflictException extends RuntimeException {
  /** The project has a newer version, so this one is archived and read-only. */
  public static final String NOT_LATEST_VERSION = "NOT_LATEST_VERSION";

  /** The project was saved by someone else since the request's lockNumber was read. */
  public static final String STALE_LOCK_NUMBER = "STALE_LOCK_NUMBER";

  /** Username is already taken when creating a new user */
  public static final String USERNAME_ALREADY_EXISTS = "USERNAME_ALREADY_EXISTS";

  /** The user can already access a project with the requested name. */
  public static final String PROJECT_NAME_ALREADY_EXISTS = "PROJECT_NAME_ALREADY_EXISTS";

  /** The user is already a member of the project. */
  public static final String ALREADY_MEMBER = "ALREADY_MEMBER";

  /** Removing the user would leave the project with nobody who can open it. */
  public static final String LAST_MEMBER = "LAST_MEMBER";

  private final String code;

  public ConflictException(String code, String message) {
    super(message);
    this.code = code;
  }

  public String getCode() {
    return code;
  }
}
