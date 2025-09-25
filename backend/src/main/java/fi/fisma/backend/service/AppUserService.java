package fi.fisma.backend.service;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserService {
  private final AppUserRepository appUserRepository;
  private final ProjectRepository projectRepository;
  private final PasswordEncoder passwordEncoder;

  public void changePassword(String updatedPassword, Authentication authentication) {
    var appUser = appUserRepository.findByUsername(authentication.getName());
    if (appUser == null) throw new EntityNotFoundException("User not found");

    appUserRepository.save(
        new AppUser(
            appUser.getId(), appUser.getUsername(), passwordEncoder.encode(updatedPassword)));
  }

  public void deleteAppUser(Authentication authentication) {
    var appUser = appUserRepository.findByUsername(authentication.getName());
    if (appUser == null) {
      throw new EntityNotFoundException("User not found");
    }

    var appUsersProjects = projectRepository.findAllByUsername(authentication.getName());
    appUsersProjects.forEach(
        project -> {
          if (project.getAppUsers().size() == 1) {
            projectRepository.deleteById(project.getId());
          }
        });

    appUserRepository.deleteById(appUser.getId());
  }
}
