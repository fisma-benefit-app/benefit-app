package fi.fisma.backend.api;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import fi.fisma.backend.service.ProjectCommentService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.security.core.Authentication;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.dto.ProjectCommentRequest;
import org.springframework.web.bind.annotation.*;
;
@RestController
@RequestMapping("/projectcomments")
@RequiredArgsConstructor
@Tag(
    name = "Project Comments",
    description = "Endpoints for managing comments within projects"
)
@SecurityRequirement(name = "bearerAuth")
public class ProjectCommentController {
    private final ProjectCommentService projectCommentService;

    @PostMapping("/projects/{projectId}")
    @Operation(
        summary = "Create a new comment",
        description = "Creates a new comment in the specified project")
    @ApiResponses(
        value = {
            @ApiResponse(
                responseCode = "200",
                description = "Comment created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid comment data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
        })
    public ResponseEntity<ProjectResponse> createProjectComment(
        @PathVariable Long projectId,
        @RequestBody ProjectCommentRequest request,
        Authentication authentication) {
        ProjectResponse response =
            projectCommentService.createaProjectComment(
                projectId, request, authentication.getName());
        return ResponseEntity.ok(response);
        }
    @DeleteMapping("/{commentId}/projects/{projectId}")
    @Operation(
        summary = "Delete a comment",
        description = "Deletes a comment from the specified project")
    @ApiResponses(
        value = {
            @ApiResponse(
                responseCode = "200",
                description = "Comment deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Comment or project not found")
        })
    public ResponseEntity<ProjectResponse> deleteProjectComment(
        @PathVariable Long commentId,
        @PathVariable Long projectId,
        Authentication authentication) {
        ProjectResponse response =
            projectCommentService.deleteProjectComment(
                commentId, projectId, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
