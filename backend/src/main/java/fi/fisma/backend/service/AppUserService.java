package fi.fisma.backend.service;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.dto.AppUserRequest;
import fi.fisma.backend.dto.AppUserSummary;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.stream.Collectors;
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
  private final PasswordEncoder passwordEncoder;

  /**
   * Retrieves a user by their ID
   *
   * @param id ID of the user to find
   * @return User response DTO
   * @throws EntityNotFoundException if user not found
   */
  @Transactional(readOnly = true)
  public AppUserSummary findById(Long id) {
    return appUserRepository
        .findByIdActive(id)
        .map(this::mapToSummary)
        .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
  }

  /**
   * Retrieves all active users in the system
   *
   * @return List of user response DTOs
   */
  @Transactional(readOnly = true)
  public List<AppUserSummary> findAll() {
    return appUserRepository.findAllActive().stream()
        .map(this::mapToSummary)
        .collect(Collectors.toList());
  }

  /**
   * Creates a new user account
   *
   * @param request User creation request
   * @return Created user response
   * @throws IllegalArgumentException if username already exists
   */
  @Transactional
  public AppUserSummary createAppUser(AppUserRequest request) {
    if (appUserRepository.existsByUsernameActive(request.getUsername())) {
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
   * Updates an existing user's information
   *
   * @param id ID of the user to update
   * @param request Updated user information
   * @return Updated user response
   * @throws EntityNotFoundException if user not found
   * @throws IllegalArgumentException if new username already exists
   */
  @Transactional
  public AppUserSummary updateAppUser(Long id, AppUserRequest request) {
    var user =
        appUserRepository
            .findByIdActive(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));

    // Check if new username is taken by another user
    if (!user.getUsername().equals(request.getUsername())
        && appUserRepository.existsByUsernameActive(request.getUsername())) {
      throw new IllegalArgumentException("Username already exists: " + request.getUsername());
    }

    validatePasswordRequirements(request.getPassword());

    user.setUsername(request.getUsername());
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    var updatedUser = appUserRepository.save(user);

    return mapToSummary(updatedUser);
  }

  /**
   * Deletes user account and associated projects
   *
   * @param authentication Current user's authentication
   * @throws EntityNotFoundException if user not found
   */
  @Transactional
  public void deleteAppUser(Authentication authentication) {
    AppUser appUser = getUserFromAuthentication(authentication);

    var userProjects = projectRepository.findAllByUsername(appUser.getUsername());

    userProjects.forEach(
        project -> {
          if (project.getProjectAppUsers().size() == 1) {
            projectRepository.deleteById(project.getId());
          }
        });

    appUserRepository.deleteById(appUser.getId());
  }

  /**
   * Changes password for authenticated user
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

  /**
   * Helper method that gets user summary for authenticated user
   *
   * @param authentication Current user's authentication
   * @return AppUserSummary
   * @throws EntityNotFoundException if user not found
   */
  @Transactional(readOnly = true)
  public AppUserSummary getCurrentUser(Authentication authentication) {
    AppUser user = getUserFromAuthentication(authentication);
    return new AppUserSummary(user.getId(), user.getUsername());
  }

  private AppUser getUserFromAuthentication(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new UnauthorizedException("User not authenticated");
    }

    AppUser appUser =
        appUserRepository
            .findByUsername(authentication.getName())
            .orElseThrow(
                () -> new EntityNotFoundException("User not found: " + authentication.getName()));

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
}
