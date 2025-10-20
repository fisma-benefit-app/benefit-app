package fi.fisma.backend.api;

import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.service.FunctionalComponentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
      description = "Creates a new functional component in the specified project")
  public ResponseEntity<ProjectResponse> createFunctionalComponent(
      @PathVariable Long projectId,
      @RequestBody FunctionalComponentRequest request,
      Authentication authentication) {
    ProjectResponse response =
        functionalComponentService.createFunctionalComponent(
            projectId, request, authentication.getName());
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{componentId}/projects/{projectId}")
  @Operation(
      summary = "Delete a functional component",
      description = "Soft deletes a functional component from the specified project")
  public ResponseEntity<ProjectResponse> deleteFunctionalComponent(
      @PathVariable Long componentId, @PathVariable Long projectId, Authentication authentication) {
    ProjectResponse response =
        functionalComponentService.deleteFunctionalComponent(
            componentId, projectId, authentication.getName());
    return ResponseEntity.ok(response);
  }
}
