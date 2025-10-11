package fi.fisma.backend.repository;

import fi.fisma.backend.domain.AppUser;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
  @Query("SELECT u FROM AppUser u WHERE u.id = :id AND u.deletedAt IS NULL")
  Optional<AppUser> findByIdActive(@Param("id") Long id);

  @Query("SELECT u FROM AppUser u WHERE u.deletedAt IS NULL")
  List<AppUser> findAllActive();

  @Query("SELECT u FROM AppUser u WHERE u.username = :username AND u.deletedAt IS NULL")
  Optional<AppUser> findByUsernameActive(@Param("username") String username);

  @Query(
      "SELECT pau.appUser FROM ProjectAppUser pau WHERE pau.id = :id AND pau.appUser.deletedAt IS NULL")
  Optional<AppUser> findByProjectAppUserIdActive(@Param("id") Long id);
}
