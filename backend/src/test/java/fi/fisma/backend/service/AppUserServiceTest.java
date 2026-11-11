package fi.fisma.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.domain.EnumUserRole;
import fi.fisma.backend.dto.AppUserRequest;
import fi.fisma.backend.exception.ConflictException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.time.Clock;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

class AppUserServiceTest {
  private AppUserRepository appUserRepository;
  private PasswordEncoder passwordEncoder;
  private AppUserService appUserService;
  private Authentication adminAuthentication;

  @BeforeEach
  void setUp() {
    appUserRepository = mock(AppUserRepository.class);
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    ProjectService projectService = mock(ProjectService.class);
    passwordEncoder = mock(PasswordEncoder.class);
    adminAuthentication =
        UsernamePasswordAuthenticationToken.authenticated("admin", null, List.of());

    appUserService =
        new AppUserService(
            appUserRepository,
            projectRepository,
            projectService,
            passwordEncoder,
            Clock.systemUTC());

    when(appUserRepository.findByUsernameActive("admin"))
        .thenReturn(Optional.of(new AppUser(1L, "admin", "admin-hash", EnumUserRole.ADMIN, null)));
  }

  @Test
  void adminCanCreateUserWithRequestedRoleAndEncodedPassword() {
    AppUserRequest request = newUserRequest("new-user", EnumUserRole.ADMIN);
    when(appUserRepository.findByUsername("new-user")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
    when(appUserRepository.save(any(AppUser.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    AppUser created = appUserService.createNewAppUser(request, adminAuthentication);

    assertThat(created.getUsername()).isEqualTo("new-user");
    assertThat(created.getPassword()).isEqualTo("encoded-password");
    assertThat(created.getRole()).isEqualTo(EnumUserRole.ADMIN);
    verify(passwordEncoder).encode("password123");
    verify(appUserRepository).save(created);
  }

  @Test
  void duplicateUsernameIsRejected() {
    AppUserRequest request = newUserRequest("existing-user", EnumUserRole.USER);
    when(appUserRepository.findByUsername("existing-user"))
        .thenReturn(Optional.of(new AppUser(2L, "existing-user", "hash", EnumUserRole.USER, null)));

    assertThatThrownBy(() -> appUserService.createNewAppUser(request, adminAuthentication))
        .isInstanceOfSatisfying(
            ConflictException.class,
            exception -> {
              assertThat(exception.getMessage()).isEqualTo("Username is already taken");
              assertThat(exception.getCode()).isEqualTo(ConflictException.USERNAME_ALREADY_EXISTS);
            });

    verify(appUserRepository, never()).save(any(AppUser.class));
    verify(passwordEncoder, never()).encode(any(CharSequence.class));
  }

  @Test
  void nonAdminCannotCreateUser() {
    Authentication userAuthentication =
        UsernamePasswordAuthenticationToken.authenticated("user", null, List.of());
    when(appUserRepository.findByUsernameActive("user"))
        .thenReturn(Optional.of(new AppUser(3L, "user", "user-hash", EnumUserRole.USER, null)));

    assertThatThrownBy(
            () ->
                appUserService.createNewAppUser(
                    newUserRequest("new-user", EnumUserRole.USER), userAuthentication))
        .isInstanceOf(UnauthorizedException.class)
        .hasMessage("Only admins can create new users");

    verify(appUserRepository, never()).findByUsername(any());
    verify(appUserRepository, never()).save(any(AppUser.class));
  }

  private static AppUserRequest newUserRequest(String username, EnumUserRole role) {
    AppUserRequest request = new AppUserRequest();
    request.setUsername(username);
    request.setPassword("password123");
    request.setRole(role);
    return request;
  }
}
