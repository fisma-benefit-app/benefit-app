package fi.fisma.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import fi.fisma.backend.mapper.ProjectMapper;
import fi.fisma.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import fi.fisma.backend.mapper.ProjectCommentMapper;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.domain.ProjectComment;
import fi.fisma.backend.repository.ProjectCommentRepository;
import fi.fisma.backend.dto.ProjectCommentRequest;
import fi.fisma.backend.dto.ProjectResponse;

@Service
@Validated
@RequiredArgsConstructor
public class ProjectCommentService {
    private final ProjectRepository projectRepository;
    private final ProjectService projectService;
    private final ProjectCommentMapper projectCommentMapper;
    private final ProjectCommentRepository projectCommentRepository;
    private final ProjectMapper projectMapper;

    @Transactional
    public ProjectResponse createaProjectComment(
            Long projectId, ProjectCommentRequest request, String username) {

        var project = projectService.findProjectForUser(projectId, username);
        var newProjectComment = projectCommentMapper.toEntity(request, project);
        projectCommentRepository.save(newProjectComment);
        project.getProjectComments().add(newProjectComment);
        Project updatedProject = projectRepository.save(project);
        return projectMapper.toResponse(updatedProject);
    }
    @Transactional
    public ProjectResponse deleteProjectComment(
            Long projectCommentId, Long projectId, String username){
        var project = projectService.findProjectForUser(projectId, username); 
        var projectComment = projectCommentRepository.findById(projectCommentId)
            .orElseThrow(() -> new RuntimeException("Project comment not found"));
        projectCommentRepository.delete(projectComment);
        Project updatedProject = projectRepository.save(project);
        return projectMapper.toResponse(updatedProject);
    }
}
