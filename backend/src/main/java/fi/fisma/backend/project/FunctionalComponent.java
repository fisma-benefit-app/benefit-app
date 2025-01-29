package fi.fisma.backend.project;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
@AllArgsConstructor
public class FunctionalComponent {
    @Id
    private Long id;
    private String className;
    private String componentType;
    private int dataElements;
    private int readinReferences;
    private int writeinReferences;
    private int functionalMultiplier;
    private int operations;
}
