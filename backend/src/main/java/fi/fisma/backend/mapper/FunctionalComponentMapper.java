package fi.fisma.backend.mapper;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.dto.FunctionalComponentRequest;
import org.springframework.stereotype.Component;

@Component
public class FunctionalComponentMapper {

  public FunctionalComponent toEntity(FunctionalComponentRequest request) {
    return new FunctionalComponent(
        null,
        request.getClassName(),
        request.getComponentType(),
        request.getDataElements(),
        request.getReadingReferences(),
        request.getWritingReferences(),
        request.getFunctionalMultiplier(),
        request.getOperations(),
        request.getDegreeOfCompletion(),
        request.getTitle(),
        request.getDescription(),
        request.getPreviousFCId(),
        request.getOrderPosition());
  }
}
