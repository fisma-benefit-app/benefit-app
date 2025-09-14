package fi.fisma.backend.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FunctionalComponent {
  @Id private Long id;

  private String className;
  private String componentType;
  private Integer dataElements;
  private Integer readingReferences;
  private Integer writingReferences;
  private Integer functionalMultiplier;
  private Integer operations;
  private Double degreeOfCompletion;
  private String comment;
  private Long previousFCId;

  @JsonProperty("order_position")
  private Integer orderPosition;
}
