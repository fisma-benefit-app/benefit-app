package fi.fisma.backend.service;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.dto.AppUserSummary;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import jakarta.validation.constraints.NotBlank;
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
          if (project.getAppUsers().size() == 1) {
            projectRepository.deleteById(project.getId());
          }
        });

    appUserRepository.deleteById(appUser.getId());
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

    AppUser appUser = appUserRepository.findByUsername(authentication.getName());
    if (appUser == null) {
      throw new EntityNotFoundException("User not found: " + authentication.getName());
    }

    return appUser;
  }

  private void validatePasswordRequirements(String password) {
    if (password == null || password.length() > 64) {
      throw new IllegalArgumentException("Password must be less than 64 characters");
    }
    // Add more password validation rules as needed
  }
}
