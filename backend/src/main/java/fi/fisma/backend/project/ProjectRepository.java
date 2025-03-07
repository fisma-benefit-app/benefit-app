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
            JOIN app_user u ON pau.app_user_id = u.id
            WHERE p.id = :projectId AND u.username = :username
            """)
    Optional<Project> findByProjectIdAndUsername(@Param("projectId") Long projectId, @Param("username") String username);
    
    @Query("""
            SELECT p.*
            FROM project p
            JOIN project_app_user pau ON p.id = pau.project_id
            JOIN app_user u ON pau.app_user_id = u.id
            WHERE u.username = :username
            """)
    List<Project> findAllByUsername(@Param("username") String username);
    
    @Query("""
            SELECT EXISTS(
                SELECT 1
                FROM project p
                JOIN project_app_user pau ON p.id = pau.project_id
                JOIN app_user u ON pau.app_user_id = u.id
                WHERE p.id = :projectId AND u.username = :username
                )
            """)
    boolean existsByProjectIdAndUsername(@Param("projectId") Long projectId, @Param("username") String username);
}
