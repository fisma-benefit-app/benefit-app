package fi.fisma.backend.repository;

import org.springframework.data.repository.ListCrudRepository;

import fi.fisma.backend.domain.AppUser;

public interface AppUserRepository extends ListCrudRepository<AppUser, Long> {
    AppUser findByUsername(String username);
}
