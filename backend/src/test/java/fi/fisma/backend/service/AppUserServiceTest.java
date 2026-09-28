package fi.fisma.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.dto.AppUserRequest;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

class AppUserServiceTest {

  private AppUserRepository appUserRepository;
  private PasswordEncoder passwordEncoder;
  private AppUserService appUserService;

  private AppUser alice;
  private Authentication aliceAuth;

  @BeforeEach
  void setUp() {
    appUserRepository = mock(AppUserRepository.class);
    passwordEncoder = mock(PasswordEncoder.class);
    appUserService =
        new AppUserService(
            appUserRepository,
            mock(ProjectRepository.class),
            mock(ProjectService.class),
            passwordEncoder);

    alice = new AppUser(1L, "alice", "old-hash", null);
    aliceAuth = new TestingAuthenticationToken("alice", null, "ROLE_USER");

    when(appUserRepository.findByUsernameActive("alice")).thenReturn(Optional.of(alice));
    when(appUserRepository.findByIdActive(1L)).thenReturn(Optional.of(alice));
    when(appUserRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));
    when(passwordEncoder.encode("newPass123")).thenReturn("new-hash");
  }

  @Test
  void updateAppUserRejectsUsernameChange() {
    var request = new AppUserRequest();
    request.setUsername("bob");
    request.setPassword("newPass123");

    assertThatThrownBy(() -> appUserService.updateAppUser(1L, request, aliceAuth))
        .isInstanceOf(UnauthorizedException.class);

    assertThat(alice.getUsername()).isEqualTo("alice");
    assertThat(alice.getPassword()).isEqualTo("old-hash");
    verify(appUserRepository, never()).save(any(AppUser.class));
  }

  @Test
  void updateAppUserWithSameUsernameUpdatesPassword() {
    var request = new AppUserRequest();
    request.setUsername("alice");
    request.setPassword("newPass123");

    var result = appUserService.updateAppUser(1L, request, aliceAuth);

    assertThat(result.username()).isEqualTo("alice");
    assertThat(alice.getPassword()).isEqualTo("new-hash");
    verify(appUserRepository).save(alice);
  }
}
