package fi.fisma.backend.exception;

/** Body of a 409 response; the client tells the kinds of conflict apart by {@code code}. */
public record ConflictResponse(String code, String message) {}
