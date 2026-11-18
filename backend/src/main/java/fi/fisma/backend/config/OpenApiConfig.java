package fi.fisma.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

@OpenAPIDefinition(
    info =
        @Info(
            title = "Project API",
            version = "1.0.2",
            description =
                "API reference for Benefit.\n\n"
                    + "Sign in with `POST /token`, using Basic credentials and "
                    + "`X-Benefit-Login: 1`. Use the returned JWT as "
                    + "`Authorization: Bearer <token>` on subsequent requests. "
                    + "See the [authentication guide](../guides/authentication.md) "
                    + "for session renewal, expiration, and logout.\n\n"
                    + "Project owners can edit the latest version and manage access. "
                    + "Added project members have view-only access to project data."))
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT")
@SecurityScheme(name = "basicAuth", type = SecuritySchemeType.HTTP, scheme = "basic")
public class OpenApiConfig {}
