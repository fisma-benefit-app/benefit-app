package fi.fisma.backend.project;

import fi.fisma.backend.appuser.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/projects")
public class ProjectController {
    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;
    
    @GetMapping("/{requestedId}")
    private ResponseEntity<Project> getProject(@PathVariable Long requestedId, Principal principal) {
        var project = projectRepository.findByProjectIdAndUsername(requestedId, principal.getName());
        return project.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping
    private ResponseEntity<List<Project>> getAllProjects(Principal principal) {
        var projects = projectRepository.findAllByUsername(principal.getName());
        return ResponseEntity.ok(projects);
    }
    
    @PutMapping("/{requestedId}")
    private ResponseEntity<Project> updateProject(@PathVariable Long requestedId, @RequestBody Project projectUpdate, Principal principal) {
        var projectOptional = projectRepository.findByProjectIdAndUsername(requestedId, principal.getName());
        if (projectOptional.isPresent()) {
            var project = projectOptional.get();
            var updatedProject = projectRepository.save(
                    new Project(project.getId(), projectUpdate.getProjectName(), projectUpdate.getVersion(), projectUpdate.getCreatedDate(), projectUpdate.getTotalPoints(), projectUpdate.getFunctionalComponents(), projectUpdate.getAppUsers()));
            return ResponseEntity.ok(updatedProject);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    private ResponseEntity<Void> createProject(@RequestBody Project newProjectRequest, UriComponentsBuilder ucb, Principal principal) {
        var appUser = appUserRepository.findByUsername(principal.getName());
        if (appUser != null) {
            var savedProject = projectRepository.save(
                    new Project(null, newProjectRequest.getProjectName(), newProjectRequest.getVersion(), LocalDateTime.now(), newProjectRequest.getTotalPoints(), newProjectRequest.getFunctionalComponents(), Set.of(new ProjectAppUser(appUser.getId())))
            );
            URI locationOfNewProject = ucb
                    .path("/projects/{id}")
                    .buildAndExpand(savedProject.getId())
                    .toUri();
            return ResponseEntity.created(locationOfNewProject).build();
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // Todo - refactor with exception handling
    }
    
    @DeleteMapping("/{requestedId}")
    private ResponseEntity<Void> deleteProject(@PathVariable Long requestedId, Principal principal) {
        if (projectRepository.existsByProjectIdAndUsername(requestedId, principal.getName())) {
            projectRepository.deleteById(requestedId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
}
