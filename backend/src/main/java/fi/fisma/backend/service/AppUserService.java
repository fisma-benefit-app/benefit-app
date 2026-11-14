package fi.fisma.backend.service;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.domain.EnumUserRole;
import fi.fisma.backend.dto.AppUserRequest;
import fi.fisma.backend.dto.AppUserSummary;
import fi.fisma.backend.exception.ConflictException;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import fi.fisma.backend.security.AccountSessionValidator;
import jakarta.validation.constraints.NotBlank;
import java.time.Clock;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
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
  private final Clock clock;

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
   * Tells if a username is already found in the database. Currently checks every user including the
   * soft-deleted ones, in order to preserve the unique username constraint in the app_users table.
   *
   * @param username username that is checked
   * @return True if username found, false if not
   */
  public boolean existsByUsername(String username) {
    return appUserRepository.findByUsername(username).isPresent();
  }

  /**
   * Creates a new application user.
   *
   * @param userRequest user data to save
   * @return The AppUser that was saved in the database
   * @throws UnauthorizedException if the current user is not an admin
   */
  public AppUser createNewAppUser(AppUserRequest userRequest, Authentication authentication) {
    var currentUser = getUserFromAuthentication(authentication);
    if (currentUser.getRole() != EnumUserRole.ADMIN) {
      throw new UnauthorizedException("Only admins can create new users");
    }

    if (existsByUsername(userRequest.getUsername())) {
      throw new ConflictException(
          ConflictException.USERNAME_ALREADY_EXISTS, "Username is already taken");
    }

    AppUser newUser =
        new AppUser(
            userRequest.getUsername(),
            passwordEncoder.encode(userRequest.getPassword()),
            userRequest.getRole());
    return appUserRepository.save(newUser);
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

    LocalDateTime deletionTime = LocalDateTime.now(clock);

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
  public void changePassword(
      @NotBlank String currentPassword,
      @NotBlank String newPassword,
      Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new UnauthorizedException("Authentication required");
    }
    // Serialize changes before checking the password and advancing the session version.
    AppUser appUser =
        appUserRepository
            .findByUsernameActiveForUpdate(authentication.getName())
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
    if (authentication instanceof JwtAuthenticationToken jwtAuthentication
        && !AccountSessionValidator.matches(jwtAuthentication.getToken(), appUser)) {
      throw new UnauthorizedException("Account session is no longer valid");
    }

    if (currentPassword == null
        || !passwordEncoder.matches(currentPassword, appUser.getPassword())) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    validatePasswordRequirements(newPassword);

    appUser.setPassword(passwordEncoder.encode(newPassword));
    appUser.setSessionVersion(Math.incrementExact(appUser.getSessionVersion()));
    appUserRepository.save(appUser);
  }

  private AppUser getUserFromAuthentication(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
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
