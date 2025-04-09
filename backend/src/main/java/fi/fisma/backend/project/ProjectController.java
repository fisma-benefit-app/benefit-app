package fi.fisma.backend.project;

import fi.fisma.backend.appuser.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/projects")
public class ProjectController {
    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;
    
    @GetMapping("/{requestedId}")
    private ResponseEntity<Project> getProject(@PathVariable Long requestedId, Authentication authentication) {
        return projectRepository.findByProjectIdAndUsername(requestedId, authentication.getName())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping
    private ResponseEntity<List<Project>> getAllProjects(Authentication authentication) {
        var projects = projectRepository.findAllByUsername(authentication.getName());
        return ResponseEntity.ok(projects);
    }
    
    @PutMapping("/{requestedId}")
    private ResponseEntity<Project> updateProject(@PathVariable Long requestedId, @RequestBody Project projectUpdate, Authentication authentication) {
        return projectRepository.findByProjectIdAndUsername(requestedId, authentication.getName())
                .map(project -> projectRepository.save(
                        new Project(project.getId(), projectUpdate.getProjectName(), projectUpdate.getVersion(), projectUpdate.getCreatedDate(), projectUpdate.getVersionDate(), projectUpdate.getEditedDate(), projectUpdate.getTotalPoints(), projectUpdate.getFunctionalComponents(), projectUpdate.getAppUsers())))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping
    private ResponseEntity<Void> createProject(@RequestBody Project newProjectRequest, UriComponentsBuilder ucb, Authentication authentication) {
        var appUser = appUserRepository.findByUsername(authentication.getName());
        if (appUser != null) {
            var savedProject = projectRepository.save(
                    new Project(null, newProjectRequest.getProjectName(), newProjectRequest.getVersion(), newProjectRequest.getCreatedDate(), newProjectRequest.getVersionDate(), newProjectRequest.getEditedDate(), newProjectRequest.getTotalPoints(), newProjectRequest.getFunctionalComponents(), Set.of(new ProjectAppUser(appUser.getId())))
            );
            URI locationOfNewProject = ucb
                    .path("/projects/{id}")
                    .buildAndExpand(savedProject.getId())
                    .toUri();
            return ResponseEntity.created(locationOfNewProject).build();
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // Todo - refactor with exception handling
    }
    
    @PostMapping("/create-version")
    private ResponseEntity<Void> createProjectVersion(@RequestBody Project newProjectVersion, Authentication authentication,UriComponentsBuilder ucb) {
        var appUser = appUserRepository.findByUsername(authentication.getName());
        if (appUser != null) {
            var savedNewVersionProject = projectRepository.save(
                    new Project(
                            null,
                            newProjectVersion.getProjectName(),
                            newProjectVersion.getVersion(),
                            newProjectVersion.getCreatedDate(),
                            newProjectVersion.getVersionDate(),
                            newProjectVersion.getEditedDate(),
                            newProjectVersion.getTotalPoints(),
                            Set.of(),
                            newProjectVersion.getAppUsers()
                    ));
            var functionalComponentsForNewVersion = newProjectVersion.getFunctionalComponents()
                    .stream()
                    .map(functionalComponent -> new FunctionalComponent(
                            null,
                            functionalComponent.getClassName(),
                            functionalComponent.getComponentType(),
                            functionalComponent.getDataElements(),
                            functionalComponent.getReadingReferences(),
                            functionalComponent.getWritingReferences(),
                            functionalComponent.getFunctionalMultiplier(),
                            functionalComponent.getOperations(),
                            functionalComponent.getDegreeOfCompletion(),
                            functionalComponent.getComment(),
                            functionalComponent.getId()
                    ))
                    .collect(Collectors.toSet());
            savedNewVersionProject.setFunctionalComponents(functionalComponentsForNewVersion);
            projectRepository.save(savedNewVersionProject);
            URI locationOfNewProject = ucb
                    .path("/projects/{id}")
                    .buildAndExpand(savedNewVersionProject.getId())
                    .toUri();
            return ResponseEntity.created(locationOfNewProject).build();
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    
    @DeleteMapping("/{requestedId}")
    private ResponseEntity<Void> deleteProject(@PathVariable Long requestedId, Authentication authentication) {
        if (projectRepository.existsByProjectIdAndUsername(requestedId, authentication.getName())) {
            projectRepository.deleteById(requestedId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
}
