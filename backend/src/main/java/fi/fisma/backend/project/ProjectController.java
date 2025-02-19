package fi.fisma.backend.project;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/projects")
public class ProjectController {
    private final ProjectRepository projectRepository;
    
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
}
