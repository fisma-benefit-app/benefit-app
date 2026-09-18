package fi.fisma.backend.repository;

import fi.fisma.backend.domain.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, Long> {
  @Query("SELECT c FROM Comment c WHERE c.project.id = :projectId ORDER BY c.id ASC")
  List<Comment> findAllByProjectId(@Param("projectId") Long projectId);
}
