package fi.fisma.backend.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.fisma.backend.domain.FunctionalComponent;
import fi.fisma.backend.domain.Project;
import fi.fisma.backend.dto.FunctionalComponentRequest;
import fi.fisma.backend.dto.ProjectRequest;
import fi.fisma.backend.repository.FunctionalComponentRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FunctionalComponentMapperTest {

  private FunctionalComponentRepository functionalComponentRepository;
  private FunctionalComponentMapper functionalComponentMapper;
  private Project project;

  @BeforeEach
  void setUp() {
    functionalComponentRepository = mock(FunctionalComponentRepository.class);
    functionalComponentMapper = new FunctionalComponentMapper(functionalComponentRepository);

    project = new Project("Test Project", 1, Set.of(), Set.of());
    project.setId(1L);
  }

  @Test
  void updatingAParentWithUnchangedSubComponentIdsDoesNotDropThem() {
    FunctionalComponent parent = parentWithFourSubComponents();

    when(functionalComponentRepository.findByIdActive(2671L, project.getId()))
        .thenReturn(Optional.of(parent));

    ProjectRequest request = new ProjectRequest();
    request.setFunctionalComponents(Set.of(parentRequestReReferencingSameSubComponentIds()));

    Set<FunctionalComponent> result =
        functionalComponentMapper.updateEntityFromRequest(project, request);

    assertThat(result).hasSize(1);
    FunctionalComponent updatedParent = result.iterator().next();
    assertThat(updatedParent.getSubComponents()).hasSize(4);
    assertThat(updatedParent.getSubComponents())
        .extracting(FunctionalComponent::getId)
        .containsExactlyInAnyOrder(2673L, 2674L, 2675L, 2676L);
    assertThat(updatedParent.getSubComponents())
        .filteredOn(sub -> sub.getId().equals(2673L))
        .extracting(FunctionalComponent::getTitle)
        .containsExactly("Komponentti 6-UI-B updated");

    // Sub-components that are still referenced by the request must never be re-queried:
    // doing so previously raced with the orphanRemoval delete scheduled by clearing the
    // collection, and made an unchanged sub-component look "not found".
    verify(functionalComponentRepository, never()).findByIdActive(eq(2673L), anyLong());
    verify(functionalComponentRepository, never()).findByIdActive(eq(2674L), anyLong());
    verify(functionalComponentRepository, never()).findByIdActive(eq(2675L), anyLong());
    verify(functionalComponentRepository, never()).findByIdActive(eq(2676L), anyLong());
    verify(functionalComponentRepository, never()).save(any());
  }

  private FunctionalComponent parentWithFourSubComponents() {
    FunctionalComponent parent = new FunctionalComponent();
    parent.setId(2671L);
    parent.setTitle("Komponentti 6");
    parent.setOrderPosition(2);
    parent.setIsMLA(true);
    parent.setIsReadonly(false);
    parent.setProject(project);
    parent.setSubComponents(subComponents(parent));
    return parent;
  }

  private List<FunctionalComponent> subComponents(FunctionalComponent parent) {
    return new ArrayList<>(
        List.of(
            subComponent(2673L, "Komponentti 6-UI-B", parent),
            subComponent(2674L, "Komponentti 6-UI-B", parent),
            subComponent(2675L, "Komponentti 6-B-UI", parent),
            subComponent(2676L, "Komponentti 6-B-UI", parent)));
  }

  private FunctionalComponent subComponent(Long id, String title, FunctionalComponent parent) {
    FunctionalComponent subComponent = new FunctionalComponent();
    subComponent.setId(id);
    subComponent.setTitle(title);
    subComponent.setOrderPosition(2);
    subComponent.setIsMLA(false);
    subComponent.setIsReadonly(true);
    subComponent.setParentFCId(parent.getId());
    subComponent.setProject(project);
    return subComponent;
  }

  private FunctionalComponentRequest parentRequestReReferencingSameSubComponentIds() {
    FunctionalComponentRequest parentRequest = new FunctionalComponentRequest();
    parentRequest.setId(2671L);
    parentRequest.setTitle("Komponentti 6");
    parentRequest.setOrderPosition(2);
    parentRequest.setIsMLA(true);
    parentRequest.setIsReadonly(false);
    parentRequest.setSubComponents(
        List.of(
            subComponentRequest(2673L, "Komponentti 6-UI-B updated"),
            subComponentRequest(2674L, "Komponentti 6-UI-B"),
            subComponentRequest(2675L, "Komponentti 6-B-UI"),
            subComponentRequest(2676L, "Komponentti 6-B-UI")));
    return parentRequest;
  }

  private FunctionalComponentRequest subComponentRequest(Long id, String title) {
    FunctionalComponentRequest subRequest = new FunctionalComponentRequest();
    subRequest.setId(id);
    subRequest.setTitle(title);
    subRequest.setOrderPosition(2);
    subRequest.setIsMLA(false);
    subRequest.setIsReadonly(true);
    subRequest.setParentFCId(2671L);
    return subRequest;
  }
}
