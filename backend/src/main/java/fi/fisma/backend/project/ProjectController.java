package fi.fisma.backend.project;

import fi.fisma.backend.appuser.AppUserRepository;
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
    private final AppUserRepository appUserRepository;
    
    @GetMapping("/{requestedId}")
    private ResponseEntity<Project> getProject(@PathVariable Long requestedId, Principal principal) {
        var user = appUserRepository.findByUsername(principal.getName()); // No Optional because findByUsername is also used in UserDetailsServiceImpl
        if (user == null) {
            return ResponseEntity.notFound().build(); // TODO - refactor ProjectAppUser to use username?
        }
        var project = projectRepository.findByProjectIdAndAppUserId(requestedId, user.getId());
        return project.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping
    private ResponseEntity<List<Project>> getAllProjects(Principal principal) {
        var user = appUserRepository.findByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.notFound().build(); // TODO - refactor ProjectAppUser to use username?
        }
        var projects = projectRepository.findAllByAppUserId(user.getId());
        return ResponseEntity.ok(projects);
    }
    
    @PutMapping("/{requestedId}")
    private ResponseEntity<Project> updateProject(@PathVariable Long requestedId, @RequestBody Project projectUpdate, Principal principal) {
        var user = appUserRepository.findByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.notFound().build(); // TODO - refactor ProjectAppUser to use username?
        }
        var projectOptional = projectRepository.findByProjectIdAndAppUserId(requestedId, user.getId());
        if (projectOptional.isPresent()) {
            var project = projectOptional.get();
            var updatedProject = projectRepository.save(
                    new Project(project.getId(), projectUpdate.getProjectName(), projectUpdate.getVersion(), projectUpdate.getCreatedDate(), projectUpdate.getTotalPoints(), projectUpdate.getFunctionalComponents(), projectUpdate.getAppUsers()));
            return ResponseEntity.ok(updatedProject);
        }
        return ResponseEntity.notFound().build();
    }
}
