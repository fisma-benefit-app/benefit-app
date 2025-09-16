package fi.fisma.backend.repository;

import fi.fisma.backend.domain.AppUser;
import org.springframework.data.repository.ListCrudRepository;

public interface AppUserRepository extends ListCrudRepository<AppUser, Long> {
  AppUser findByUsername(String username);
}
