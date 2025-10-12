package fi.fisma.backend.api;

import fi.fisma.backend.dto.AppUserRequest;
import fi.fisma.backend.dto.AppUserSummary;
import fi.fisma.backend.dto.PasswordChangeRequest;
import fi.fisma.backend.service.AppUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
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

  @GetMapping("/{id}")
  @Operation(summary = "Get user by ID", description = "Retrieves a specific user by their ID")
  @ApiResponse(responseCode = "200", description = "User found")
  @ApiResponse(responseCode = "404", description = "User not found")
  public ResponseEntity<AppUserSummary> getById(@PathVariable Long id) {
    return ResponseEntity.ok(appUserService.findById(id));
  }

  @GetMapping
  @Operation(summary = "Get all users", description = "Retrieves all active users in the system")
  @ApiResponse(responseCode = "200", description = "List of users retrieved")
  public ResponseEntity<List<AppUserSummary>> getAll() {
    return ResponseEntity.ok(appUserService.findAll());
  }

  @PostMapping
  @Operation(summary = "Create new user", description = "Creates a new user account")
  @ApiResponse(responseCode = "201", description = "User created successfully")
  @ApiResponse(responseCode = "400", description = "Invalid user data")
  public ResponseEntity<AppUserSummary> createAppUser(@Valid @RequestBody AppUserRequest request) {
    var newUser = appUserService.createAppUser(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update user", description = "Updates an existing user's information")
  @ApiResponse(responseCode = "200", description = "User updated successfully")
  @ApiResponse(responseCode = "404", description = "User not found")
  public ResponseEntity<AppUserSummary> updateAppUser(
      @PathVariable Long id, @Valid @RequestBody AppUserRequest request) {
    return ResponseEntity.ok(appUserService.updateAppUser(id, request));
  }

  @DeleteMapping
  @Operation(
      summary = "Delete user account",
      description = "Permanently deletes the authenticated user's account")
  @ApiResponse(responseCode = "204", description = "Account deleted successfully")
  @ApiResponse(responseCode = "401", description = "User not authenticated")
  public ResponseEntity<Void> deleteAppUser(Authentication authentication) {
    appUserService.deleteAppUser(authentication);
    return ResponseEntity.noContent().build();
  }

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
}
