package fi.fisma.backend.project;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Data
@AllArgsConstructor
public class FunctionalComponent {
    @Id
    private Long id;
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
}
