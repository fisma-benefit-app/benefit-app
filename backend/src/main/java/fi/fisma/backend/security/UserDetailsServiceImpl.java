package fi.fisma.backend.security;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.repository.AppUserRepository;
import java.util.Collection;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
  private final AppUserRepository appUserRepository;
  private final LoginAttemptThrottleService loginAttemptThrottleService;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

    if (loginAttemptThrottleService.isBlocked(username)) {
      throw new LockedException(
          "Too many failed login attempts for user " + username + ". Please try again later.");
    }

    AppUser appUser =
        this.appUserRepository
            .findByUsernameActive(username)
            .orElseThrow(
                () -> {
                  if (loginAttemptThrottleService.recordFailure(username)) {
                    return new LockedException(
                        "Too many failed login attempts. Please try again later.");
                  }
                  return new UsernameNotFoundException("username " + username + " is not found");
                });
    return new AppUserDetails(appUser);
  }

  public static final class AppUserDetails extends AppUser implements UserDetails {
    AppUserDetails(AppUser appUser) {
      super(
          appUser.getId(),
          appUser.getUsername(),
          appUser.getPassword(),
          appUser.getRole(),
          appUser.getDeletedAt());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
      return Collections.unmodifiableList(
          AuthorityUtils.createAuthorityList("ROLE_" + getRole().name()));
    }
  }
}
