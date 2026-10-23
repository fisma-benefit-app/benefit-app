package fi.fisma.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.security.LoginAttemptThrottleService;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Runs the project API end to end against Postgres to check that the backend, not the browser,
 * enforces project integrity: membership, validation, archived versions and concurrent saves.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectIntegrityIntegrationTest {

  private static final String PASSWORD = "integrity-test-password";

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private AppUserRepository appUserRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private JdbcTemplate jdbcTemplate;
  @Autowired private DataSource dataSource;
  @Autowired private LoginAttemptThrottleService loginAttemptThrottleService;

  private final List<Long> projectIds = new ArrayList<>();
  private final List<AppUser> users = new ArrayList<>();
  private String suffix;
  private String alice;
  private String mallory;

  @BeforeEach
  void createSchemaAndUsers() throws Exception {
    // schema-dev.sql is the dev schema; its leading DROP TABLE would wipe a developer's database,
    // so run only the idempotent CREATE ... IF NOT EXISTS statements.
    String schema =
        new String(
            new ClassPathResource("schema-dev.sql").getInputStream().readAllBytes(),
            StandardCharsets.UTF_8);
    String withoutDrop = schema.replaceAll("(?m)^DROP TABLE.*$", "");
    try (var connection = dataSource.getConnection()) {
      ScriptUtils.executeSqlScript(
          connection, new ByteArrayResource(withoutDrop.getBytes(StandardCharsets.UTF_8)));
    }

    suffix = UUID.randomUUID().toString().substring(0, 8);
    alice = createUser("alice-" + suffix);
    mallory = createUser("mallory-" + suffix);
  }

  @AfterEach
  void deleteTestData() {
    for (Long id : projectIds) {
      jdbcTemplate.update("DELETE FROM projects_app_users WHERE project_id = ?", id);
      jdbcTemplate.update("DELETE FROM functional_components WHERE project_id = ?", id);
      jdbcTemplate.update("DELETE FROM projects WHERE id = ?", id);
    }
    for (AppUser user : users) {
      loginAttemptThrottleService.reset(user.getUsername());
      appUserRepository.deleteById(user.getId());
    }
  }

  // --- membership ---

  @Test
  void putCannotMoveAnotherUsersMembershipOntoOwnProject() throws Exception {
    long alicesProject = createProject(alice, "alice-project-" + suffix);
    long alicesMembership = membershipIds(alicesProject).get(0);
    long malloryProject = createProject(mallory, "mallory-project-" + suffix);

    JsonNode current = getProject(mallory, malloryProject);
    mockMvc.perform(
        put("/projects/{id}", malloryProject)
            .header("Authorization", bearer(mallory))
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                body(
                    "mallory-project-" + suffix, 1, current, List.of(), Set.of(alicesMembership))));

    assertThat(membershipIds(alicesProject)).containsExactly(alicesMembership);
    mockMvc
        .perform(get("/projects/{id}", alicesProject).header("Authorization", bearer(alice)))
        .andExpect(status().isOk());
  }

  @Test
  void putCannotRemoveTheCallersOwnMembership() throws Exception {
    long malloryProject = createProject(mallory, "mallory-project-" + suffix);
    List<Long> before = membershipIds(malloryProject);

    mockMvc.perform(
        put("/projects/{id}", malloryProject)
            .header("Authorization", bearer(mallory))
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                body(
                    "mallory-project-" + suffix,
                    1,
                    getProject(mallory, malloryProject),
                    List.of(),
                    Set.of())));

    assertThat(membershipIds(malloryProject)).isEqualTo(before);
    mockMvc
        .perform(get("/projects/{id}", malloryProject).header("Authorization", bearer(mallory)))
        .andExpect(status().isOk());
  }

  // --- helpers ---

  private String createUser(String username) {
    AppUser user =
        appUserRepository.save(new AppUser(null, username, passwordEncoder.encode(PASSWORD), null));
    users.add(user);
    return username;
  }

  private String bearer(String username) throws Exception {
    MvcResult result =
        mockMvc.perform(post("/token").with(httpBasic(username, PASSWORD))).andReturn();
    assertThat(result.getResponse().getStatus()).isEqualTo(200);
    return result.getResponse().getHeader("Authorization");
  }

  private long createProject(String username, String name) throws Exception {
    MvcResult result =
        mockMvc
            .perform(
                post("/projects")
                    .header("Authorization", bearer(username))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body(name, 1, null, List.of(), Set.of())))
            .andExpect(status().isCreated())
            .andReturn();
    return trackedIdFromLocation(result);
  }

  private long createVersion(String username, long fromId, String name, int version)
      throws Exception {
    MvcResult result =
        mockMvc
            .perform(
                post("/projects/{id}/versions", fromId)
                    .header("Authorization", bearer(username))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body(name, version, null, List.of(), Set.of())))
            .andExpect(status().isCreated())
            .andReturn();
    return trackedIdFromLocation(result);
  }

  private long trackedIdFromLocation(MvcResult result) {
    String location = result.getResponse().getHeader("Location");
    long id = Long.parseLong(location.substring(location.lastIndexOf('/') + 1));
    projectIds.add(id);
    return id;
  }

  private JsonNode addComponent(String username, long projectId, Map<String, Object> component)
      throws Exception {
    MvcResult result =
        mockMvc
            .perform(
                post("/functional-components/projects/{id}", projectId)
                    .header("Authorization", bearer(username))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(component)))
            .andExpect(status().isOk())
            .andReturn();
    return objectMapper
        .readTree(result.getResponse().getContentAsString())
        .path("functionalComponents")
        .get(0);
  }

  private JsonNode getProject(String username, long id) throws Exception {
    MvcResult result =
        mockMvc
            .perform(get("/projects/{id}", id).header("Authorization", bearer(username)))
            .andExpect(status().isOk())
            .andReturn();
    return objectMapper.readTree(result.getResponse().getContentAsString());
  }

  private List<Long> membershipIds(long projectId) {
    return jdbcTemplate.queryForList(
        "SELECT id FROM projects_app_users WHERE project_id = ? ORDER BY id",
        Long.class,
        projectId);
  }

  private String body(
      String name,
      int version,
      JsonNode current,
      List<Map<String, Object>> components,
      Set<Long> projectAppUserIds)
      throws Exception {
    return body(name, version, current, components, projectAppUserIds, null);
  }

  /** A project request the way the frontend sends it; {@code current} supplies the lockVersion. */
  private String body(
      String name,
      int version,
      JsonNode current,
      List<Map<String, Object>> components,
      Set<Long> projectAppUserIds,
      String reportNotes)
      throws Exception {
    Map<String, Object> request = new HashMap<>();
    request.put("projectName", name);
    request.put("version", version);
    request.put("reportNotes", reportNotes);
    request.put("functionalComponents", components);
    request.put("projectAppUserIds", projectAppUserIds);
    if (current != null && current.hasNonNull("lockVersion")) {
      request.put("lockVersion", current.get("lockVersion").asLong());
    }
    return objectMapper.writeValueAsString(request);
  }

  private static Map<String, Object> component(String title) {
    Map<String, Object> component = new HashMap<>();
    component.put("title", title);
    component.put("className", "Interactive end-user input service");
    component.put("componentType", "Interactive");
    component.put("dataElements", 3);
    component.put("readingReferences", 1);
    component.put("writingReferences", 1);
    component.put("functionalMultiplier", 1);
    component.put("operations", 1);
    component.put("degreeOfCompletion", 0.5);
    component.put("orderPosition", 0);
    component.put("isMLA", false);
    component.put("isReadonly", false);
    return component;
  }
}
