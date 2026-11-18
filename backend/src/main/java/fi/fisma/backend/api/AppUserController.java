package fi.fisma.backend.api;

import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.dto.AppUserRequest;
import fi.fisma.backend.dto.AppUserSummary;
import fi.fisma.backend.dto.PasswordChangeRequest;
import fi.fisma.backend.exception.ConflictResponse;
import fi.fisma.backend.service.AppUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/appusers")
@Tag(name = "User Management", description = "Endpoints for managing user accounts")
@SecurityRequirement(name = "bearerAuth")
public class AppUserController {
  private final AppUserService appUserService;

  @PostMapping
  @Operation(
      summary = "Create a new app user",
      description = "Creates a user account. Only administrators can create accounts")
  @ApiResponse(responseCode = "201", description = "User created successfully")
  @ApiResponse(
      responseCode = "409",
      description = "Username already taken",
      content =
          @Content(
              mediaType = "application/json",
              schema = @Schema(implementation = ConflictResponse.class)))
  @ApiResponse(
      responseCode = "403",
      description = "User is not an admin",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  @ApiResponse(
      responseCode = "400",
      description = "Invalid account data",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  public ResponseEntity<AppUserSummary> createNewUser(
      @RequestBody @Valid AppUserRequest newUser, Authentication authentication) {
    AppUser savedUser = appUserService.createNewAppUser(newUser, authentication);

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(new AppUserSummary(savedUser.getId(), savedUser.getUsername()));
  }

  @GetMapping("/{id}")
  @Operation(
      summary = "Get user by ID",
      description =
          "Retrieves the authenticated user's own details; another user's ID is rejected with 403")
  @ApiResponse(responseCode = "200", description = "User found")
  @ApiResponse(
      responseCode = "404",
      description = "User not found",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  @ApiResponse(
      responseCode = "403",
      description = "Users can only view their own details",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  public ResponseEntity<AppUserSummary> getByUserId(
      @PathVariable Long id, Authentication authentication) {
    return ResponseEntity.ok(appUserService.findById(id, authentication));
  }

  @DeleteMapping("/{id}")
  @Operation(
      summary = "Delete user account",
      description = "Soft deletes the authenticated user's account and invalidates its sessions")
  @ApiResponse(responseCode = "204", description = "Account deleted successfully")
  @ApiResponse(responseCode = "401", description = "User not authenticated", content = @Content)
  @ApiResponse(
      responseCode = "403",
      description = "Users can only delete their own account",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  @ApiResponse(
      responseCode = "404",
      description = "User not found",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  public ResponseEntity<Void> deleteAppUser(
      @PathVariable("id") Long id, Authentication authentication) {
    appUserService.deleteAppUser(id, authentication);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/password")
  @Operation(
      summary = "Change user password",
      description =
          "Changes the authenticated user's password after verifying currentPassword. Success invalidates all existing sessions, including the current session; sign in again")
  @ApiResponse(
      responseCode = "403",
      description = "Current password is incorrect",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  @ApiResponse(responseCode = "200", description = "Password changed successfully")
  @ApiResponse(
      responseCode = "400",
      description = "Invalid password format",
      content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
  @ApiResponse(responseCode = "401", description = "User not authenticated", content = @Content)
  public ResponseEntity<String> changePassword(
      @Valid @RequestBody PasswordChangeRequest request, Authentication authentication) {
    appUserService.changePassword(
        request.getCurrentPassword(), request.getNewPassword(), authentication);
    return ResponseEntity.ok("Password changed successfully");
  }
}
