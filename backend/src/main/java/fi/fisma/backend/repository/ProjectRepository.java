package fi.fisma.backend.repository;

import fi.fisma.backend.domain.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {
  @Query(
      value =
          """
        SELECT p.*
        FROM projects p
        WHERE p.id = :projectId
        AND p.deleted_at IS NULL
        AND EXISTS (
          SELECT 1
          FROM projects_app_users pau
          JOIN app_users u ON pau.app_user_id = u.id
          WHERE pau.project_id = p.id
          AND u.username = :username
          AND u.deleted_at IS NULL
        )
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

  @Query(
      """
      SELECT p FROM Project p JOIN p.projectAppUsers member JOIN member.appUser u
      WHERE p.familyId = :familyId AND p.deletedAt IS NULL
      AND u.username = :username AND u.deletedAt IS NULL
      """)
  List<Project> findActiveVersions(UUID familyId, String username);

  // The earliest row remains a stable lock target even after soft deletion.
  @Query(
      value =
          """
          SELECT root.id FROM projects root
          WHERE root.id = (
            SELECT MIN(version.id) FROM projects version
            WHERE version.family_id = (
              SELECT p.family_id FROM projects p
              WHERE p.id = :projectId AND p.deleted_at IS NULL
              AND EXISTS (
                SELECT 1 FROM projects_app_users member
                JOIN app_users u ON u.id = member.app_user_id
                WHERE member.project_id = p.id AND u.username = :username
                AND u.deleted_at IS NULL
              )
            )
          )
          FOR UPDATE
          """,
      nativeQuery = true)
  Optional<Long> lockFamilyForMember(Long projectId, String username);
}
