package fi.fisma.backend.repository;

import fi.fisma.backend.domain.CalculationReportComment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CalculationReportCommentRepository
    extends JpaRepository<CalculationReportComment, Long> {
  @Query(
      "SELECT c FROM CalculationReportComment c WHERE c.project.id = :projectId ORDER BY c.id ASC")
  List<CalculationReportComment> findAllByProjectId(@Param("projectId") Long projectId);
}