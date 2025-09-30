# Architecture Decision Record: Backend Package Structure

Date: 2025-09-30

## Status

Draft

## Context

The backend system is built and maintained using a layered architecture. To keep code organized and maintainable, we have structured the backend into the following packages:

- api - REST controllers exposing endpoints to clients
- domain - Core business entities and logic
- dto - Data Transfer Objects for API communication
- exception - Centralized error handling and custom exceptions
- mapper - Converters between domain models and DTOs
- repository - Data persistence layer (interfaces to the database)
- security - Authentication, authorization, and security configuration
- service - Business logic orchestrating repositories, domain, and mappers

This structure follows common practices in Spring Boot and domain-driven design principles. It provides clear separation of concerns and improves testability. However, there is a risk for over-engineering: changes now touch multiple layers, even if they are easier to find.

## Decision

We will use the layered package structure described above for our backend services.

## Consequences

- The layered architecture remains consistent and scalable for the foreseeable future.
- Developers must remain disciplined to prevent business logic from leaking into controllers or repositories.
- As the codebase grows, feature-based modularization may be needed to improve cohesion around business domains.
