package fi.fisma.backend.mapper;

import fi.fisma.backend.domain.Comment;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.CommentRequest;
import fi.fisma.backend.dto.CommentResponse;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

  public Comment toEntity(CommentRequest request, Project project) {
    var comment = new Comment();
    comment.setText(request.getText());
    comment.setProject(project);
    return comment;
  }

  public CommentResponse toResponse(Comment comment) {
    return new CommentResponse(comment.getId(), comment.getText(), comment.getProject().getId());
  }

  public void updateEntityFromRequest(Comment comment, CommentRequest request) {
    comment.setText(request.getText());
  }
}
