package fi.fisma.backend.exception;

import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<String> handleEntityNotFoundException(EntityNotFoundException exception) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exception.getMessage());
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<String> handleUnauthorizedException(UnauthorizedException exception) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(exception.getMessage());
  }

  @ExceptionHandler(java.lang.IllegalStateException.class)
  public ResponseEntity<String> handleIllegalStateException(
      java.lang.IllegalStateException exception) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getMessage());
  }

  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ConflictResponse> handleConflictException(ConflictException exception) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(new ConflictResponse(exception.getCode(), exception.getMessage()));
  }

  @ExceptionHandler(OptimisticLockingFailureException.class)
  public ResponseEntity<ConflictResponse> handleOptimisticLockingFailure() {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(
            new ConflictResponse(
                ConflictException.STALE_LOCK_VERSION,
                "The project was changed by someone else. Reload it and try again."));
  }
}
