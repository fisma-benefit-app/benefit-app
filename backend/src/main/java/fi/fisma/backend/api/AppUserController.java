package fi.fisma.backend.api;

import fi.fisma.backend.service.AppUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/appusers")
public class AppUserController {
  private final AppUserService appUserService;

  @PutMapping
  public ResponseEntity<Void> changePassword(
      @RequestBody String updatedPassword, Authentication authentication) {

    appUserService.changePassword(updatedPassword, authentication);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping
  public ResponseEntity<Void> deleteAppUser(Authentication authentication) {
    appUserService.deleteAppUser(authentication);
    return ResponseEntity.noContent().build();
  }
}
