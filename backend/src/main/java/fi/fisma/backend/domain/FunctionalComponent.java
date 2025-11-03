package fi.fisma.backend.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "functional_components")
public class FunctionalComponent {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Size(max = 255, message = "Title must not exceed 255 characters")
  @Column(name = "title")
  private String title;

  @Size(max = 1000, message = "Description must not exceed 1000 characters")
  @Column(name = "description")
  private String description;

  @Size(max = 255, message = "Class name must not exceed 255 characters")
  @Column(name = "class_name")
  private String className;

  @Size(max = 255, message = "Component type must not exceed 255 characters")
  @Column(name = "component_type")
  private String componentType;

  @Min(value = 0, message = "Data elements cannot be negative")
  @Column(name = "data_elements")
  private Integer dataElements = 0;

  @Min(value = 0, message = "Reading references cannot be negative")
  @Column(name = "reading_references")
  private Integer readingReferences = 0;

  @Min(value = 0, message = "Writing references cannot be negative")
  @Column(name = "writing_references")
  private Integer writingReferences = 0;

  @Min(value = 1, message = "Functional multiplier must be at least 1")
  @Column(name = "functional_multiplier")
  private Integer functionalMultiplier = 1;

  @Min(value = 0, message = "Operations cannot be negative")
  @Column(name = "operations")
  private Integer operations = 0;

  @DecimalMin(value = "0.0", message = "Degree of completion must be between 0 and 1")
  @DecimalMax(value = "1.0", message = "Degree of completion must be between 0 and 1")
  @Column(name = "degree_of_completion")
  private Double degreeOfCompletion = 0.0;

  @Column(name = "previous_fc_id")
  private Long previousFCId;

  @NotNull(message = "Order position is required")
  @Min(value = 0, message = "Order position cannot be negative")
  @Column(name = "order_position")
  private Integer orderPosition = 0;

  @NotNull(message = "Multi-layer architecture (MLA) status must be specified")
  @Column(name = "is_mla")
  private Boolean isMLA = false;

  @Column(name = "parent_fc_id")
  private Long parentFCId;

  @Size(max = 50, message = "Sub-component type must not exceed 50 characters")
  @Column(name = "sub_component_type")
  private String subComponentType;

  @Column(name = "is_readonly")
  private Boolean isReadonly = false;

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  @JoinColumn(name = "parent_fc_id", insertable = false, updatable = false)
  private List<FunctionalComponent> subComponents = new ArrayList<>();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id")
  private Project project;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  public FunctionalComponent(
      String title,
      String description,
      String className,
      String componentType,
      Integer dataElements,
      Integer readingReferences,
      Integer writingReferences,
      Integer functionalMultiplier,
      Integer operations,
      Double degreeOfCompletion,
      Long previousFCId,
      Integer orderPosition,
      Boolean isMLA,
      Long parentFCId,
      String subComponentType,
      Boolean isReadonly,
      List<FunctionalComponent> subComponents,
      Project project,
      LocalDateTime deletedAt) {
    this.title = title;
    this.description = description;
    this.className = className;
    this.componentType = componentType;
    this.dataElements = dataElements;
    this.readingReferences = readingReferences;
    this.writingReferences = writingReferences;
    this.functionalMultiplier = functionalMultiplier;
    this.operations = operations;
    this.degreeOfCompletion = degreeOfCompletion;
    this.previousFCId = previousFCId;
    this.orderPosition = orderPosition;
    this.isMLA = isMLA;
    this.parentFCId = parentFCId;
    this.subComponentType = subComponentType;
    this.isReadonly = isReadonly;
    this.subComponents = subComponents != null ? subComponents : new ArrayList<>();
    this.project = project;
    this.deletedAt = deletedAt;
  }
}
