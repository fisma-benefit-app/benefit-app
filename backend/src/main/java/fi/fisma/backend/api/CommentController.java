package fi.fisma.backend.api;

import fi.fisma.backend.dto.CommentRequest;
import fi.fisma.backend.dto.CommentResponse;
import fi.fisma.backend.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Comment Management", description = "Endpoints for managing project comments")
@SecurityRequirement(name = "bearerAuth")
public class CommentController {

  private final CommentService commentService;

  @GetMapping("/{projectId}/comments")
  @Operation(
      summary = "Get comments for a project",
      description = "Retrieves all comments for the specified project that the user can access")
  @ApiResponse(responseCode = "200", description = "Comments returned successfully")
  @ApiResponse(responseCode = "404", description = "Project not found")
  public ResponseEntity<List<CommentResponse>> getComments(
      @Parameter(description = "ID of the project") @PathVariable Long projectId,
      Authentication authentication) {
    return ResponseEntity.ok(commentService.getComments(projectId, authentication.getName()));
  }

  @PostMapping("/{projectId}/comments")
  @Operation(
      summary = "Create a comment for a project",
      description = "Creates a new comment for the specified project")
  @ApiResponse(responseCode = "201", description = "Comment created successfully")
  @ApiResponse(responseCode = "400", description = "Invalid comment data")
  public ResponseEntity<Void> createComment(
      @Parameter(description = "ID of the project") @PathVariable Long projectId,
      @Valid @RequestBody CommentRequest request,
      Authentication authentication,
      UriComponentsBuilder ucb) {
    var savedComment = commentService.createComment(projectId, request, authentication.getName());
    URI location =
        ucb.path("/projects/{projectId}/comments/{commentId}")
            .buildAndExpand(projectId, savedComment.id())
            .toUri();
    return ResponseEntity.created(location).build();
  }

  @PutMapping("/{projectId}/comments/{commentId}")
  @Operation(
      summary = "Update a project comment",
      description = "Updates an existing comment for the specified project")
  @ApiResponse(responseCode = "200", description = "Comment updated successfully")
  @ApiResponse(responseCode = "404", description = "Comment or project not found")
  public ResponseEntity<CommentResponse> updateComment(
      @Parameter(description = "ID of the project") @PathVariable Long projectId,
      @Parameter(description = "ID of the comment to update") @PathVariable Long commentId,
      @Valid @RequestBody CommentRequest request,
      Authentication authentication) {
    var updatedComment =
        commentService.updateComment(projectId, commentId, request, authentication.getName());
    return ResponseEntity.ok(updatedComment);
  }

  @DeleteMapping("/{projectId}/comments/{commentId}")
  @Operation(
      summary = "Delete a project comment",
      description = "Deletes a comment belonging to the specified project")
  @ApiResponse(responseCode = "204", description = "Comment deleted successfully")
  @ApiResponse(responseCode = "404", description = "Comment or project not found")
  public ResponseEntity<Void> deleteComment(
      @Parameter(description = "ID of the project") @PathVariable Long projectId,
      @Parameter(description = "ID of the comment to delete") @PathVariable Long commentId,
      Authentication authentication) {
    commentService.deleteComment(projectId, commentId, authentication.getName());
    return ResponseEntity.noContent().build();
  }
}
