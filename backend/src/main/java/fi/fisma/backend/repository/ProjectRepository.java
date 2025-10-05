package fi.fisma.backend.repository;

import fi.fisma.backend.domain.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {
  @Query(
      value =
          """
              SELECT p.*
              FROM project p
              JOIN project_app_user pau ON p.id = pau.project_id
              JOIN app_user u ON pau.app_user_id = u.id
              WHERE p.id = :projectId AND u.username = :username
              """,
      nativeQuery = true)
  Optional<Project> findByProjectIdAndUsername(
      @Param("projectId") Long projectId, @Param("username") String username);

  @Query(
      value =
          """
              SELECT p.*
              FROM project p
              JOIN project_app_user pau ON p.id = pau.project_id
              JOIN app_user u ON pau.app_user_id = u.id
              WHERE u.username = :username
              """,
      nativeQuery = true)
  List<Project> findAllByUsername(@Param("username") String username);
}
