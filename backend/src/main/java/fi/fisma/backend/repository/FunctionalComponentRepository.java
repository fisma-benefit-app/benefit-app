package fi.fisma.backend.repository;

import fi.fisma.backend.domain.FunctionalComponent;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FunctionalComponentRepository extends JpaRepository<FunctionalComponent, Long> {
  @Query(
      "SELECT fc FROM FunctionalComponent fc WHERE fc.id = :id AND fc.deletedAt IS NULL AND fc.project.id = :projectId")
  Optional<FunctionalComponent> findByIdActive(
      @Param("id") Long id, @Param("projectId") Long projectId);

  @Query(
      """
        SELECT fc FROM FunctionalComponent fc
        WHERE fc.project.id = :projectId
        AND fc.deletedAt IS NULL
        ORDER BY fc.orderPosition
        """)
  List<FunctionalComponent> findAllByProjectIdActive(@Param("projectId") Long projectId);

  List<FunctionalComponent> findByParentFCIdAndDeletedAtIsNull(Long parentId);
}
