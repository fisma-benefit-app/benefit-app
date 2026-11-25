package fi.fisma.backend.mapper;

import fi.fisma.backend.domain.CalculationReportComment;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.CalculationReportCommentRequest;
import fi.fisma.backend.dto.CalculationReportCommentResponse;
import org.springframework.stereotype.Component;

@Component
public class CalculationReportCommentMapper {

  public CalculationReportComment toEntity(
      CalculationReportCommentRequest request, Project project) {
    var comment = new CalculationReportComment();
    comment.setText(request.getText());
    comment.setProject(project);
    return comment;
  }

  public CalculationReportCommentResponse toResponse(CalculationReportComment comment) {
    return new CalculationReportCommentResponse(
        comment.getId(), comment.getText(), comment.getProject().getId());
  }

  public void updateEntityFromRequest(
      CalculationReportComment comment, CalculationReportCommentRequest request) {
    comment.setText(request.getText());
  }
}
