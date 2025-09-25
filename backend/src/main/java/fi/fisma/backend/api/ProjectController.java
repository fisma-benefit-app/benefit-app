package fi.fisma.backend.api;

import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.dto.ProjectResponse;
import fi.fisma.backend.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Project Management", description = "Endpoints for managing projects")
public class ProjectController {

  private final ProjectService projectService;

  @GetMapping("/{id}")
  @Operation(
      summary = "Get a project by ID",
      description = "Retrieves a specific project if the authenticated user has access to it")
  @ApiResponse(responseCode = "200", description = "Project found and returned")
  @ApiResponse(responseCode = "404", description = "Project not found")
  @ApiResponse(responseCode = "403", description = "User does not have access to this project")
  public ResponseEntity<ProjectResponse> getProject(
      @Parameter(description = "ID of the project to retrieve") @PathVariable("id") Long id,
      Authentication authentication) {
    return ResponseEntity.ok(projectService.getProject(id, authentication.getName()));
  }

  @GetMapping
  @Operation(
      summary = "Get all projects",
      description = "Retrieves all projects accessible to the authenticated user")
  @ApiResponse(responseCode = "200", description = "List of projects returned")
  public ResponseEntity<List<ProjectResponse>> getAllProjects(Authentication authentication) {
    var projects = projectService.getAllProjects(authentication.getName());
    return ResponseEntity.ok(projects);
  }

  @PutMapping("/{id}")
  @Operation(
      summary = "Update a project",
      description = "Updates an existing project if the authenticated user owns it")
  @ApiResponse(responseCode = "200", description = "Project updated successfully")
  @ApiResponse(responseCode = "404", description = "Project not found")
  @ApiResponse(
      responseCode = "403",
      description = "User does not have permission to update this project")
  public ResponseEntity<ProjectResponse> updateProject(
      @Parameter(description = "ID of the project to update") @PathVariable("id") Long id,
      @Valid @RequestBody ProjectRequest projectUpdate,
      Authentication authentication) {
    return ResponseEntity.ok(
        projectService.updateProject(id, projectUpdate, authentication.getName()));
  }

  @PostMapping
  @Operation(
      summary = "Create a new project",
      description = "Creates a new project for the authenticated user")
  @ApiResponse(responseCode = "201", description = "Project created successfully")
  @ApiResponse(responseCode = "400", description = "Invalid project data")
  public ResponseEntity<Void> createProject(
      @Valid @RequestBody ProjectRequest newProjectRequest,
      UriComponentsBuilder ucb,
      Authentication authentication) {
    var savedProject = projectService.createProject(newProjectRequest, authentication.getName());
    URI location = ucb.path("/api/v1/projects/{id}").buildAndExpand(savedProject.getId()).toUri();
    return ResponseEntity.created(location).build();
  }

  @PostMapping("/{id}/versions")
  @Operation(
      summary = "Create a new version of a project",
      description = "Creates a new version of an existing project")
  @ApiResponse(responseCode = "201", description = "Project version created successfully")
  @ApiResponse(responseCode = "404", description = "Original project not found")
  @ApiResponse(responseCode = "403", description = "User does not have permission")
  public ResponseEntity<Void> createProjectVersion(
      @Parameter(description = "ID of the project to version") @PathVariable("id") Long id,
      @Valid @RequestBody ProjectRequest versionRequest,
      Authentication authentication,
      UriComponentsBuilder ucb) {
    var savedProject =
        projectService.createProjectVersion(id, versionRequest, authentication.getName());
    URI location = ucb.path("/api/v1/projects/{id}").buildAndExpand(savedProject.getId()).toUri();
    return ResponseEntity.created(location).build();
  }

  @DeleteMapping("/{id}")
  @Operation(
      summary = "Delete a project",
      description = "Deletes a project if the authenticated user owns it")
  @ApiResponse(responseCode = "204", description = "Project deleted successfully")
  @ApiResponse(responseCode = "404", description = "Project not found")
  @ApiResponse(
      responseCode = "403",
      description = "User does not have permission to delete this project")
  public ResponseEntity<Void> deleteProject(
      @Parameter(description = "ID of the project to delete") @PathVariable("id") Long id,
      Authentication authentication) {
    projectService.deleteProject(id, authentication.getName());
    return ResponseEntity.noContent().build();
  }
}
