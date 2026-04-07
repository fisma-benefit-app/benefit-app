package fi.fisma.backend.mapper;

import fi.fisma.backend.repository.ProjectCommentRepository;
import org.springframework.stereotype.Component;
import fi.fisma.backend.domain.ProjectComment;
import fi.fisma.backend.dto.ProjectCommentRequest;
import fi.fisma.backend.dto.ProjectCommentResponse;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.ProjectRequest;
import java.util.Set;

@Component
public class ProjectCommentMapper {
    private final ProjectCommentRepository projectCommentRepository;

    public ProjectCommentMapper(ProjectCommentRepository projectCommentRepository) {
        this.projectCommentRepository = projectCommentRepository;
    }

    public ProjectComment toEntity(ProjectCommentRequest request, Project project) {
        ProjectComment comment =
            new ProjectComment(
                request.getText(),
                project
            );
        return comment;
    }
    public ProjectCommentResponse toResponse(ProjectComment comment) {
        return new ProjectCommentResponse(
            comment.getId(),
            comment.getText()
        ); 
    }
    private ProjectComment createNewProjectComment (ProjectCommentRequest comment, Project project) {
        return toEntity(comment, project);
    }
    private void updateCommentFields(ProjectComment existing, ProjectCommentRequest comment) {
        existing.setText(comment.getText());
    }
    public Set<ProjectComment> updateEntityFromRequest(Project project, ProjectRequest request) {
        // For simplicity, we will just create a new comment if the request has text
        return Set.of(); // No comments to update
    }
}
