package fi.fisma.backend.service;

import fi.fisma.backend.domain.Comment;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.CommentRequest;
import fi.fisma.backend.dto.CommentResponse;
import fi.fisma.backend.exception.EntityNotFoundException;
import fi.fisma.backend.exception.UnauthorizedException;
import fi.fisma.backend.mapper.CommentMapper;
import fi.fisma.backend.repository.CommentRepository;
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
public class CommentService {

  private final CommentRepository commentRepository;
  private final ProjectRepository projectRepository;
  private final CommentMapper commentMapper;

  public List<CommentResponse> getComments(Long projectId, String username) {
    Project project = findProjectForUser(projectId, username);
    return commentRepository.findAllByProjectId(project.getId()).stream()
        .map(commentMapper::toResponse)
        .toList();
  }

  public CommentResponse createComment(Long projectId, CommentRequest request, String username) {
    Project project = findProjectForUser(projectId, username);
    Comment comment = commentMapper.toEntity(request, project);
    return commentMapper.toResponse(commentRepository.save(comment));
  }

  public CommentResponse updateComment(
      Long projectId, Long commentId, CommentRequest request, String username) {
    Project project = findProjectForUser(projectId, username);
    Comment comment =
        commentRepository
            .findById(commentId)
            .orElseThrow(() -> new EntityNotFoundException("Comment not found: " + commentId));

    if (!comment.getProject().getId().equals(project.getId())) {
      throw new UnauthorizedException("Comment does not belong to project: " + projectId);
    }

    commentMapper.updateEntityFromRequest(comment, request);
    return commentMapper.toResponse(commentRepository.save(comment));
  }

  public void deleteComment(Long projectId, Long commentId, String username) {
    Project project = findProjectForUser(projectId, username);
    Comment comment =
        commentRepository
            .findById(commentId)
            .orElseThrow(() -> new EntityNotFoundException("Comment not found: " + commentId));

    if (!comment.getProject().getId().equals(project.getId())) {
      throw new UnauthorizedException("Comment does not belong to project: " + projectId);
    }

    commentRepository.delete(comment);
  }

  private Project findProjectForUser(Long projectId, String username) {
    return projectRepository
        .findByProjectIdAndUsernameActive(projectId, username)
        .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
  }
}
