package fi.fisma.backend.security;

import fi.fisma.backend.appuser.AppUser;
import fi.fisma.backend.appuser.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final AppUserRepository appUserRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser appUser = this.appUserRepository.findByUsername(username);
        if (appUser == null) {
            throw new UsernameNotFoundException("username " + username + " is not found");
        }
        return new AppUserDetails(appUser);
    }
    
    static final class AppUserDetails extends AppUser implements UserDetails {
        
        private static final List<GrantedAuthority> ROLE_USER = Collections
                .unmodifiableList(AuthorityUtils.createAuthorityList("ROLE_USER"));
        
        AppUserDetails(AppUser appUser) {
            super(appUser.getId(), appUser.getUsername(), appUser.getPassword());
        }
        
        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return ROLE_USER;
        }
        
    }
    
}
