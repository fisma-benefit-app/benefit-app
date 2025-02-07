package fi.fisma.backend.project;

import fi.fisma.backend.appuser.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Optional;

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
            return ResponseEntity.notFound().build();
        }
        var project = projectRepository.findByProjectIdAndAppUserId(requestedId, user.getId());
        return project.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
   }
    
}
