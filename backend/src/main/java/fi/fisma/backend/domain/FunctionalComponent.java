package fi.fisma.backend.domain;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table("functional_components")
public class FunctionalComponent {
  @Id private Long id;

  @NotBlank(message = "Class name is required")
  @Size(max = 255, message = "Class name must not exceed 255 characters")
  @Column("class_name")
  private String className;

  @NotBlank(message = "Component type is required")
  @Column("component_type")
  private String componentType;

  @NotNull(message = "Number of data elements is required")
  @Min(value = 0, message = "Data elements cannot be negative")
  @Column("data_elements")
  private Integer dataElements = 0;

  @NotNull(message = "Number of reading references is required")
  @Min(value = 0, message = "Reading references cannot be negative")
  @Column("reading_references")
  private Integer readingReferences = 0;

  @NotNull(message = "Number of writing references is required")
  @Min(value = 0, message = "Writing references cannot be negative")
  @Column("writing_references")
  private Integer writingReferences = 0;

  @NotNull(message = "Functional multiplier is required")
  @Min(value = 1, message = "Functional multiplier must be at least 1")
  @Column("functional_multiplier")
  private Integer functionalMultiplier = 1;

  @NotNull(message = "Number of operations is required")
  @Min(value = 0, message = "Operations cannot be negative")
  @Column("operations")
  private Integer operations = 0;

  @NotNull(message = "Degree of completion is required")
  @DecimalMin(value = "0.0", message = "Degree of completion must be between 0 and 1")
  @DecimalMax(value = "1.0", message = "Degree of completion must be between 0 and 1")
  @Column("degree_of_completion")
  private Double degreeOfCompletion = 0.0;

  @NotBlank(message = "Title is required")
  @Size(max = 255, message = "Title must not exceed 255 characters")
  @Column("title")
  private String title;

  @Size(max = 1000, message = "Description must not exceed 1000 characters")
  @Column("description")
  private String description;

  @Column("previous_fc_id")
  private Long previousFCId;

  @NotNull(message = "Order position is required")
  @Min(value = 0, message = "Order position cannot be negative")
  @Column("order_position")
  private Integer orderPosition = 0;

  public FunctionalComponent(String className, String componentType, String title) {
    this.className = className;
    this.componentType = componentType;
    this.title = title;
  }

  public double calculatePoints() {
    double basePoints =
        (dataElements + readingReferences + writingReferences) * functionalMultiplier * operations;
    return basePoints * degreeOfCompletion;
  }

  public void incrementReferences() {
    this.readingReferences++;
    this.writingReferences++;
  }

  public void setCompletionStatus(double completion) {
    if (completion < 0.0 || completion > 1.0) {
      throw new IllegalArgumentException("Completion must be between 0 and 1");
    }
    this.degreeOfCompletion = completion;
  }

  public boolean isComplete() {
    return Double.compare(degreeOfCompletion, 1.0) == 0;
  }

  public boolean hasReferences() {
    return readingReferences > 0 || writingReferences > 0;
  }
}
