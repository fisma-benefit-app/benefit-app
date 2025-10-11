package fi.fisma.backend.repository;

import fi.fisma.backend.domain.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {
  @Query("SELECT p FROM Project p WHERE p.id = :id AND p.deletedAt IS NULL")
  Optional<Project> findByIdActive(@Param("id") Long id);

  @Query(
      value =
          """
        SELECT p.*
        FROM projects p
        WHERE p.deleted_at IS NULL
        """,
      nativeQuery = true)
  List<Project> findAllActive();

  @Query(
      value =
          """
        SELECT p.*
        FROM projects p
        JOIN projects_app_users pau ON p.id = pau.project_id
        JOIN app_users u ON pau.app_user_id = u.id
        WHERE p.id = :projectId
        AND u.username = :username
        AND p.deleted_at IS NULL
        AND u.deleted_at IS NULL
        """,
      nativeQuery = true)
  Optional<Project> findByProjectIdAndUsernameActive(
      @Param("projectId") Long projectId, @Param("username") String username);

  @Query(
      value =
          """
        SELECT p.*
        FROM projects p
        JOIN projects_app_users pau ON p.id = pau.project_id
        JOIN app_users u ON pau.app_user_id = u.id
        WHERE u.username = :username
        AND p.deleted_at IS NULL
        AND u.deleted_at IS NULL
        ORDER BY p.version DESC
        """,
      nativeQuery = true)
  List<Project> findAllByUsernameActive(@Param("username") String username);
}
