package fi.fisma.backend.api;

import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.exception.ConflictResponse;
import fi.fisma.backend.service.FunctionalComponentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/functional-components")
@RequiredArgsConstructor
@Tag(
    name = "Functional Components",
    description = "Endpoints for managing functional components within projects")
@SecurityRequirement(name = "bearerAuth")
public class FunctionalComponentController {

  private final FunctionalComponentService functionalComponentService;

  @PostMapping("/projects/{projectId}")
  @Operation(
      summary = "Create a new functional component",
      description =
          "Creates a new functional component in the specified project. Requires an owner and the latest project version")
  @ApiResponse(responseCode = "200", description = "Functional component created successfully")
  @ApiResponse(
      responseCode = "400",
      description = "Invalid request data",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
  @ApiResponse(
      responseCode = "403",
      description = "User is not an owner of the project",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  @ApiResponse(
      responseCode = "409",
      description = "Project is not the latest version, or changed during the request",
      content =
          @Content(
              mediaType = "application/json",
              schema = @Schema(implementation = ConflictResponse.class)))
  @ApiResponse(
      responseCode = "404",
      description = "Project or parent component not found",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  public ResponseEntity<ProjectResponse> createFunctionalComponent(
      @PathVariable Long projectId,
      @Valid @RequestBody FunctionalComponentRequest request,
      Authentication authentication) {
    ProjectResponse response =
        functionalComponentService.createFunctionalComponent(
            projectId, request, authentication.getName());
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{componentId}/projects/{projectId}")
  @Operation(
      summary = "Delete a functional component",
      description =
          "Soft deletes a functional component from the specified project. Requires an owner and the latest project version")
  @ApiResponse(responseCode = "204", description = "Functional component deleted successfully")
  @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
  @ApiResponse(
      responseCode = "403",
      description = "User is not an owner of the project",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  @ApiResponse(
      responseCode = "404",
      description = "Component or project not found",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  @ApiResponse(
      responseCode = "409",
      description = "Project is not the latest version, or changed during the request",
      content =
          @Content(
              mediaType = "application/json",
              schema = @Schema(implementation = ConflictResponse.class)))
  public ResponseEntity<ProjectResponse> deleteFunctionalComponent(
      @PathVariable Long componentId, @PathVariable Long projectId, Authentication authentication) {
    functionalComponentService.deleteFunctionalComponent(
        componentId, projectId, authentication.getName());
    return ResponseEntity.noContent().build();
  }
}
