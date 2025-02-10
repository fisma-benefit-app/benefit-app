package fi.fisma.backend.project;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends ListCrudRepository<Project, Long> {
    @Query("""
        SELECT p.*
        FROM project p
        JOIN project_app_user pau ON p.id = pau.project_id
        WHERE p.id = :projectId AND pau.app_user_id = :appUserId
    """)
    Optional<Project> findByProjectIdAndAppUserId(@Param("projectId") Long projectId, @Param("appUserId") Long appUserId);
    
    @Query("""
    SELECT p.*
    FROM project p
    JOIN project_app_user pau ON p.id = pau.project_id
    WHERE pau.app_user_id = :appUserId
""")
    List<Project> findAllByAppUserId(@Param("appUserId") Long appUserId);
}
