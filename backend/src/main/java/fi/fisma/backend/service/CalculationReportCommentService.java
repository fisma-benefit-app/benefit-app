package fi.fisma.backend.service;

import fi.fisma.backend.domain.CalculationReportComment;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.CalculationReportCommentRequest;
import fi.fisma.backend.dto.CalculationReportCommentResponse;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.mapper.CalculationReportCommentMapper;
import fi.fisma.backend.repository.CalculationReportCommentRepository;
import fi.fisma.backend.repository.ProjectRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
@RequiredArgsConstructor
@Transactional
public class CalculationReportCommentService {

  private final CalculationReportCommentRepository calculationReportCommentRepository;
  private final ProjectRepository projectRepository;
  private final CalculationReportCommentMapper calculationReportCommentMapper;

  public List<CalculationReportCommentResponse> getComments(Long projectId, String username) {
    Project project = findProjectForUser(projectId, username);
    return calculationReportCommentRepository.findAllByProjectId(project.getId()).stream()
        .map(calculationReportCommentMapper::toResponse)
        .toList();
  }

  public CalculationReportCommentResponse createComment(
      Long projectId, CalculationReportCommentRequest request, String username) {
    Project project = findProjectForUser(projectId, username);
    CalculationReportComment comment = calculationReportCommentMapper.toEntity(request, project);
    return calculationReportCommentMapper.toResponse(
        calculationReportCommentRepository.save(comment));
  }

  public CalculationReportCommentResponse updateComment(
      Long projectId, Long commentId, CalculationReportCommentRequest request, String username) {
    Project project = findProjectForUser(projectId, username);
    CalculationReportComment comment = findCommentInProject(commentId, project, projectId);
    calculationReportCommentMapper.updateEntityFromRequest(comment, request);
    return calculationReportCommentMapper.toResponse(
        calculationReportCommentRepository.save(comment));
  }

  public void deleteComment(Long projectId, Long commentId, String username) {
    Project project = findProjectForUser(projectId, username);
    CalculationReportComment comment = findCommentInProject(commentId, project, projectId);
    calculationReportCommentRepository.delete(comment);
  }

  private CalculationReportComment findCommentInProject(
      Long commentId, Project project, Long projectId) {
    CalculationReportComment comment =
        calculationReportCommentRepository
            .findById(commentId)
            .orElseThrow(
                () ->
                    new EntityNotFoundException(
                        "Calculation report comment not found: " + commentId));

    if (!comment.getProject().getId().equals(project.getId())) {
      throw new UnauthorizedException(
          "Calculation report comment does not belong to project: " + projectId);
    }
    return comment;
  }

  private Project findProjectForUser(Long projectId, String username) {
    return projectRepository
        .findByProjectIdAndUsernameActive(projectId, username)
        .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
  }
}
