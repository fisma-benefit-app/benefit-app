package fi.fisma.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import fi.fisma.backend.domain.ProjectComment;

public interface ProjectCommentRepository extends JpaRepository<ProjectComment, Long> {
    // Fill in later as needed
    @Query(
      """
        SELECT fc FROM ProjectComment fc
        WHERE fc.project.id = :projectId
        """)
    List<ProjectComment> findAllByProjectId(@Param("projectId") Long projectId);
}
