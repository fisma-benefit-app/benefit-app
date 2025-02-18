package fi.fisma.backend.project;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

import java.time.LocalDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@JsonTest
class ProjectJsonTest {
    
    @Autowired
    private JacksonTester<Project> json;
    
    private Project project;
    
    @BeforeEach
    void setUp() {
        project = new Project(44L, "project-x", 1, LocalDateTime.of(2025, 1, 28, 17, 23, 19), 100.12, Set.of(
                new FunctionalComponent(99L, "Interactive end-user input service", "1-functional", 2, 4, 3, 1, null, 0.13, "This is an exceptional functional component!"),
                new FunctionalComponent(100L, "Data storage service", "entities or classes", 4, null, null, null, null, 0.27, "Needs further adjustment!")
        ), Set.of(new ProjectAppUser(13L)));
    }
    
    @Test
    void projectSerializationTest() throws Exception {
        assertThat(json.write(project)).isEqualToJson("/json-examples/project.json");
        assertThat(json.write(project)).hasJsonPathNumberValue("@.id");
        assertThat(json.write(project)).hasJsonPathStringValue("@.projectName");
        assertThat(json.write(project)).hasJsonPathStringValue("@.createdDate");
        assertThat(json.write(project)).hasJsonPathNumberValue("@.totalPoints");
        assertThat(json.write(project)).hasJsonPathArrayValue("$.functionalComponents");
        assertThat(json.write(project)).hasJsonPathArrayValue("$.appUsers");
//      TODO - assert remaining values
    }
    
    @Test
    void projectDeserializationTest() throws Exception {
        String expected = """
                {
                  "id": 44,
                  "projectName": "project-x",
                  "version": 1,
                  "createdDate": "2025-01-28T17:23:19",
                  "totalPoints": 100.12,
                  "functionalComponents": [
                    {
                      "id": 99,
                      "className": "Interactive end-user input service",
                      "componentType": "1-functional",
                      "dataElements": 2,
                      "readingReferences": 4,
                      "writingReferences": 3,
                      "functionalMultiplier": 1,
                      "operations": null,
                      "degreeOfCompletion": 0.13,
                      "comment": "This is an exceptional functional component!"
                    },
                    {
                      "id": 100,
                      "className": "Data storage service",
                      "componentType": "entities or classes",
                      "dataElements": 4,
                      "readingReferences": null,
                      "writingReferences": null,
                      "functionalMultiplier": null,
                      "operations": null,
                      "degreeOfCompletion": 0.27,
                      "comment": "Needs further adjustment!"
                    }
                  ],
                  "appUsers": [
                    {
                      "appUserId": 13
                    }
                  ]
                }
                """;
        
        assertThat(json.parse(expected)).isEqualTo(project);
        assertThat(json.parseObject(expected).getId()).isEqualTo(44);
        assertThat(json.parseObject(expected).getProjectName()).isEqualTo("project-x");
//      TODO - assert remaining values
    }
    
}

