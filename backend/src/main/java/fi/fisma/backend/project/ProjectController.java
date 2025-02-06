package fi.fisma.backend.project;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/projects")
public class ProjectController {
    private final ProjectRepository projectRepository;
    
    @GetMapping("/{requestedId}")
    private ResponseEntity<Project> getProject(@PathVariable Long requestedId) {
        Optional<Project> project = projectRepository.findById(requestedId);
        return project.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
   }
    
}
