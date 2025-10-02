package fi.fisma.backend.repository;

import fi.fisma.backend.domain.AppUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
  Optional<AppUser> findByUsername(String username);

  @Query("SELECT pau.appUser FROM ProjectAppUser pau WHERE pau.id = :id")
  Optional<AppUser> findByProjectAppUserId(@Param("id") Long id);
}
