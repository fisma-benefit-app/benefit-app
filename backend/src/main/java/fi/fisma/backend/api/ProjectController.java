package fi.fisma.backend.api;

import fi.fisma.backend.domain.Project;
import fi.fisma.backend.service.ProjectService;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

  private final ProjectService projectService;

  @GetMapping("/{requestedId}")
  public ResponseEntity<Project> getProject(
      @PathVariable("requestedId") Long requestedId, Authentication authentication) {
    return ResponseEntity.ok(projectService.getProject(requestedId, authentication.getName()));
  }

  @GetMapping
  public ResponseEntity<List<Project>> getAllProjects(Authentication authentication) {
    var projects = projectService.getAllProjects(authentication.getName());
    return ResponseEntity.ok(projects);
  }

  @PutMapping("/{requestedId}")
  public ResponseEntity<Project> updateProject(
      @PathVariable Long requestedId,
      @RequestBody Project projectUpdate,
      Authentication authentication) {
    return ResponseEntity.ok(
        projectService.updateProject(requestedId, projectUpdate, authentication.getName()));
  }

  @PostMapping
  public ResponseEntity<Object> createProject(
      @RequestBody Project newProjectRequest,
      UriComponentsBuilder ucb,
      Authentication authentication) {
    return projectService
        .createProject(newProjectRequest, authentication.getName())
        .map(
            savedProject -> {
              URI location =
                  ucb.path("/projects/{id}").buildAndExpand(savedProject.getId()).toUri();
              return ResponseEntity.created(location).build();
            })
        .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
  }

  @PostMapping("/create-version")
  public ResponseEntity<Object> createProjectVersion(
      @RequestBody Project newProjectVersion,
      Authentication authentication,
      UriComponentsBuilder ucb) {
    return projectService
        .createProjectVersion(newProjectVersion, authentication.getName())
        .map(
            savedProject -> {
              URI location =
                  ucb.path("/projects/{id}").buildAndExpand(savedProject.getId()).toUri();
              return ResponseEntity.created(location).build();
            })
        .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
  }

  @DeleteMapping("/{requestedId}")
  public ResponseEntity<Void> deleteProject(
      @PathVariable Long requestedId, Authentication authentication) {
    projectService.deleteProject(requestedId, authentication.getName());
    return ResponseEntity.noContent().build();
  }
}
