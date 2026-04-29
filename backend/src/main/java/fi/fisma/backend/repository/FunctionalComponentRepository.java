package fi.fisma.backend.repository;

import fi.fisma.backend.domain.FunctionalComponent;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FunctionalComponentRepository extends JpaRepository<FunctionalComponent, Long> {
  @Query("SELECT fc FROM FunctionalComponent fc WHERE fc.id = :id AND fc.deletedAt IS NULL")
  Optional<FunctionalComponent> findByIdActive(@Param("id") Long id);

  @Query("SELECT fc FROM FunctionalComponent fc WHERE fc.deletedAt IS NULL")
  List<FunctionalComponent> findAllActive();

  @Query(
      """
        SELECT fc FROM FunctionalComponent fc
        WHERE fc.project.id = :projectId
        AND fc.deletedAt IS NULL
        ORDER BY fc.orderPosition
        """)
  List<FunctionalComponent> findAllByProjectIdActive(@Param("projectId") Long projectId);

  @Query(
      """
        SELECT fc FROM FunctionalComponent fc
        WHERE fc.previousFCId = :previousId
        AND fc.deletedAt IS NULL
        """)
  Optional<FunctionalComponent> findByPreviousIdActive(@Param("previousId") Long previousId);

  List<FunctionalComponent> findByParentFCIdAndDeletedAtIsNull(Long parentId);
}
