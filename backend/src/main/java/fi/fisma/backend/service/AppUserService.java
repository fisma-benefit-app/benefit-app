package fi.fisma.backend.service;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.dto.AppUserRequest;
import fi.fisma.backend.dto.AppUserSummary;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
@RequiredArgsConstructor
public class AppUserService {
  private final AppUserRepository appUserRepository;
  private final ProjectRepository projectRepository;
  private final ProjectService projectService;
  private final PasswordEncoder passwordEncoder;

  /**
   * Retrieves a user by their ID.
   *
   * @param id ID of the user to find
   * @return User response DTO
   * @throws EntityNotFoundException if user not found
   */
  @Transactional(readOnly = true)
  public AppUserSummary findById(Long id, Authentication authentication) {
    // Only allow users to view their own details
    var currentUser = getUserFromAuthentication(authentication);
    if (!currentUser.getId().equals(id)) {
      throw new UnauthorizedException("Users can only view their own details");
    }

    return appUserRepository
        .findByIdActive(id)
        .map(this::mapToSummary)
        .orElseThrow(() -> new EntityNotFoundException("User not found"));
  }

  /**
   * Creates a new user account.
   *
   * @param request User creation request
   * @return Created user response
   * @throws IllegalArgumentException if username already exists
   */
  @Transactional
  public AppUserSummary createAppUser(AppUserRequest request) {
    if (appUserRepository.findByUsernameActive(request.getUsername()).isPresent()) {
      throw new IllegalArgumentException("Username already exists: " + request.getUsername());
    }

    validatePasswordRequirements(request.getPassword());

    var newUser =
        new AppUser(
            null, request.getUsername(), passwordEncoder.encode(request.getPassword()), null);

    var savedUser = appUserRepository.save(newUser);

    return mapToSummary(savedUser);
  }

  /**
   * Updates an existing user's information.
   *
   * @param id ID of the user to update
   * @param request Updated user information
   * @return Updated user response
   * @throws EntityNotFoundException if user not found
   * @throws IllegalArgumentException if new username already exists
   */
  @Transactional
  public AppUserSummary updateAppUser(
      Long id, AppUserRequest request, Authentication authentication) {
    getUserFromAuthentication(authentication);

    var user =
        appUserRepository
            .findByIdActive(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));

    // Check if new username is taken by another user
    if (!user.getUsername().equals(request.getUsername())
        && appUserRepository.findByUsernameActive(request.getUsername()).isPresent()) {
      throw new IllegalArgumentException("Username already exists: " + request.getUsername());
    }

    validatePasswordRequirements(request.getPassword());

    user.setUsername(request.getUsername());
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    var updatedUser = appUserRepository.save(user);

    return mapToSummary(updatedUser);
  }

  /**
   * Deletes user account and associated projects.
   *
   * @param authentication Current user's authentication
   * @throws EntityNotFoundException if user not found
   */
  @Transactional
  public void deleteAppUser(Long id, Authentication authentication) {
    // First get the authenticated user for authorization
    AppUser authenticatedUser = getUserFromAuthentication(authentication);

    // Then get the user to delete
    AppUser userToDelete =
        appUserRepository
            .findByIdActive(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));

    // Only allow users to delete their own account
    if (!authenticatedUser.getId().equals(userToDelete.getId())) {
      throw new UnauthorizedException("Users can only delete their own account");
    }

    LocalDateTime deletionTime = LocalDateTime.now();

    // Handle associated projects
    handleProjectsForUserDeletion(userToDelete, deletionTime);

    // Soft delete the user
    userToDelete.setDeletedAt(deletionTime);
    appUserRepository.save(userToDelete);
  }

  /**
   * Changes password for authenticated user.
   *
   * @param newPassword New password to set
   * @param authentication Current user's authentication
   * @throws EntityNotFoundException if user not found
   * @throws UnauthorizedException if password change not allowed
   */
  @Transactional
  public void changePassword(@NotBlank String newPassword, Authentication authentication) {
    AppUser appUser = getUserFromAuthentication(authentication);

    validatePasswordRequirements(newPassword);

    appUser.setPassword(passwordEncoder.encode(newPassword));
    appUserRepository.save(appUser);
  }

  private AppUser getUserFromAuthentication(Authentication authentication) {
    if (authentication == null) {
      throw new UnauthorizedException("Authentication required");
    }

    AppUser appUser =
        appUserRepository
            .findByUsernameActive(authentication.getName())
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

    return appUser;
  }

  private void validatePasswordRequirements(String password) {
    if (password == null || password.length() > 64) {
      throw new IllegalArgumentException("Password must be less than 64 characters");
    }
    // Add more password validation rules as needed
  }

  private AppUserSummary mapToSummary(AppUser user) {
    return new AppUserSummary(user.getId(), user.getUsername());
  }

  /** Helper method to handle projects when deleting a user. */
  private void handleProjectsForUserDeletion(AppUser appUser, LocalDateTime deletionTime) {
    var userProjects = projectRepository.findAllByUsernameActive(appUser.getUsername());

    userProjects.forEach(
        project -> {
          if (project.getProjectAppUsers().size() == 1) {
            // Soft delete projects where user is the only member
            projectService.deleteProject(project.getId(), appUser.getUsername());
          } else {
            // Remove user from projects with multiple members
            project
                .getProjectAppUsers()
                .removeIf(pau -> pau.getAppUser().getId().equals(appUser.getId()));
            projectRepository.save(project);
          }
        });
  }
}
