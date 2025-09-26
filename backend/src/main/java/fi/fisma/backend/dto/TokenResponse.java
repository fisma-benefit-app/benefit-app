package fi.fisma.backend.dto;

public record TokenResponse(String token, String tokenType, long expiresIn) {}
