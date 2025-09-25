package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response object containing summary on app user")
public class AppUserSummary {
  Long id;
  String username;
}
