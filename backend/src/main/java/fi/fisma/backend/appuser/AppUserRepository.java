package fi.fisma.backend.appuser;

import org.springframework.data.repository.ListCrudRepository;

public interface AppUserRepository extends ListCrudRepository<AppUser, Long> {
    AppUser findByUsername(String username);
}
