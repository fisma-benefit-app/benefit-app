package fi.fisma.backend.appuser;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/appusers")
public class AppUserController {
    private final AppUserRepository appUserRepository;
    
    @PutMapping
    private ResponseEntity<Void> changePassword(@RequestBody String updatedPassword, Principal principal, BCryptPasswordEncoder passwordEncoder) {
        var appUser = appUserRepository.findByUsername(principal.getName());
        if (appUser != null) {
            appUserRepository.save(
                    new AppUser(appUser.getId(), appUser.getUsername(), passwordEncoder.encode(updatedPassword))
            );
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build(); // Todo - refactor with exception handling
    }
}
