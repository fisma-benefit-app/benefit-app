public class CalculationReportCommentController {
    
}
package fi.fisma.backend.api;

import fi.fisma.backend.dto.CalculationReportCommentRequest;
import fi.fisma.backend.dto.CalculationReportCommentResponse;
import fi.fisma.backend.service.CalculationReportCommentService;
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
@Tag(
    name = "Calculation Report Comment Management",
    description = "Endpoints for managing calculation report comments")
@SecurityRequirement(name = "bearerAuth")
public class CalculationReportCommentController {

  private final CalculationReportCommentService calculationReportCommentService;

  @GetMapping("/{projectId}/calculation-report-comments")
  @Operation(
      summary = "Get calculation report comments for a project",
      description =
          "Retrieves all calculation report comments for the specified project that the user can"
              + " access")
  @ApiResponse(responseCode = "200", description = "Comments returned successfully")
  @ApiResponse(responseCode = "404", description = "Project not found")
  public ResponseEntity<List<CalculationReportCommentResponse>> getComments(
      @Parameter(description = "ID of the project") @PathVariable Long projectId,
      Authentication authentication) {
    return ResponseEntity.ok(
        calculationReportCommentService.getComments(projectId, authentication.getName()));
  }

  @PostMapping("/{projectId}/calculation-report-comments")
  @Operation(
      summary = "Create a calculation report comment",
      description = "Creates a new calculation report comment for the specified project")
  @ApiResponse(responseCode = "201", description = "Comment created successfully")
  @ApiResponse(responseCode = "400", description = "Invalid comment data")
  public ResponseEntity<Void> createComment(
      @Parameter(description = "ID of the project") @PathVariable Long projectId,
      @Valid @RequestBody CalculationReportCommentRequest request,
      Authentication authentication,
      UriComponentsBuilder ucb) {
    var savedComment =
        calculationReportCommentService.createComment(
            projectId, request, authentication.getName());
    URI location =
        ucb.path("/projects/{projectId}/calculation-report-comments/{commentId}")
            .buildAndExpand(projectId, savedComment.id())
            .toUri();
    return ResponseEntity.created(location).build();
  }

  @PutMapping("/{projectId}/calculation-report-comments/{commentId}")
  @Operation(
      summary = "Update a calculation report comment",
      description = "Updates an existing calculation report comment for the specified project")
  @ApiResponse(responseCode = "200", description = "Comment updated successfully")
  @ApiResponse(responseCode = "404", description = "Comment or project not found")
  public ResponseEntity<CalculationReportCommentResponse> updateComment(
      @Parameter(description = "ID of the project") @PathVariable Long projectId,
      @Parameter(description = "ID of the comment to update") @PathVariable Long commentId,
      @Valid @RequestBody CalculationReportCommentRequest request,
      Authentication authentication) {
    return ResponseEntity.ok(
        calculationReportCommentService.updateComment(
            projectId, commentId, request, authentication.getName()));
  }

  @DeleteMapping("/{projectId}/calculation-report-comments/{commentId}")
  @Operation(
      summary = "Delete a calculation report comment",
      description = "Deletes a calculation report comment belonging to the specified project")
  @ApiResponse(responseCode = "204", description = "Comment deleted successfully")
  @ApiResponse(responseCode = "404", description = "Comment or project not found")
  public ResponseEntity<Void> deleteComment(
      @Parameter(description = "ID of the project") @PathVariable Long projectId,
      @Parameter(description = "ID of the comment to delete") @PathVariable Long commentId,
      Authentication authentication) {
    calculationReportCommentService.deleteComment(projectId, commentId, authentication.getName());
    return ResponseEntity.noContent().build();
  }
}