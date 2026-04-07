package fi.fisma.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(
    description = "Request object for creating or updating comments within a project"
)
public class ProjectCommentRequest {
    @Schema(description = "Unique identifier", example = "1")
    private Long id;

    @Size(max = 200, message = "Content must not exceed 200 characters")
    @Schema(
        description = "Comment content"
    )
    private String text;
}
