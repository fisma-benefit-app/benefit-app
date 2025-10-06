package fi.fisma.backend.api;

import fi.fisma.backend.dto.PasswordChangeRequest;
import fi.fisma.backend.service.AppUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/appusers")
@Tag(name = "User Management", description = "Endpoints for managing user accounts")
public class AppUserController {
  private final AppUserService appUserService;

  @PutMapping("/password")
  @Operation(
      summary = "Change user password",
      description = "Allows authenticated users to change their password")
  @ApiResponse(responseCode = "200", description = "Password changed successfully")
  @ApiResponse(responseCode = "400", description = "Invalid password format")
  @ApiResponse(responseCode = "401", description = "User not authenticated")
  public ResponseEntity<String> changePassword(
      @Valid @RequestBody PasswordChangeRequest request, Authentication authentication) {
    appUserService.changePassword(request.getNewPassword(), authentication);
    return ResponseEntity.ok("Password changed successfully");
  }

  @DeleteMapping
  @Operation(
      summary = "Delete user account",
      description = "Soft deletes the authenticated user's account")
  @ApiResponse(responseCode = "204", description = "Account deleted successfully")
  @ApiResponse(responseCode = "401", description = "User not authenticated")
  public ResponseEntity<Void> deleteAppUser(Authentication authentication) {
    appUserService.deleteAppUser(authentication);
    return ResponseEntity.noContent().build();
  }
}
