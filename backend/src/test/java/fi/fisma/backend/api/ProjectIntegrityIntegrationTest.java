package fi.fisma.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.repository.AppUserRepository;
import fi.fisma.backend.security.LoginAttemptThrottleService;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
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
import org.springframework.test.web.servlet.ResultActions;

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

  @Test
  void memberCanAddAnotherUserToAllVersionsOfAProject() throws Exception {
    String name = "shared-" + suffix;
    long v1 = createProject(alice, name);
    long v2 = createVersion(alice, v1, name, 2);

    addMember(alice, v2, mallory)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.projectAppUsers.length()").value(2));

    assertThat(membershipIds(v1)).hasSize(2);
    assertThat(membershipIds(v2)).hasSize(2);
    mockMvc
        .perform(get("/projects/{id}", v1).header("Authorization", bearer(mallory)))
        .andExpect(status().isOk());

    // The new member can edit the latest version like the one who shared it.
    mockMvc
        .perform(
            put("/projects/{id}", v2)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    body(name, 2, getProject(mallory, v2), List.of(), Set.of(), "from mallory")))
        .andExpect(status().isOk());
  }

  @Test
  void newVersionKeepsEveryMemberOfTheProject() throws Exception {
    String name = "shared-version-" + suffix;
    long v1 = createProject(alice, name);
    addMember(alice, v1, mallory).andExpect(status().isOk());

    long v2 = createVersion(mallory, v1, name, 2);

    assertThat(membershipIds(v2)).hasSize(2);
    mockMvc
        .perform(get("/projects/{id}", v2).header("Authorization", bearer(alice)))
        .andExpect(status().isOk());
  }

  @Test
  void nonMemberCannotAddUsersToAProject() throws Exception {
    long alicesProject = createProject(alice, "alice-project-" + suffix);
    List<Long> before = membershipIds(alicesProject);

    addMember(mallory, alicesProject, mallory).andExpect(status().isNotFound());

    assertThat(membershipIds(alicesProject)).isEqualTo(before);
  }

  @Test
  void addingAnExistingMemberOrUnknownUserIsRejected() throws Exception {
    long id = createProject(alice, "reject-" + suffix);
    addMember(alice, id, mallory).andExpect(status().isOk());

    addMember(alice, id, mallory)
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("ALREADY_MEMBER"));
    addMember(alice, id, "nobody-" + suffix).andExpect(status().isNotFound());
    addMember(alice, id, " ").andExpect(status().isBadRequest());

    assertThat(membershipIds(id)).hasSize(2);
  }

  @Test
  void memberCanRemoveAnotherMemberFromAllVersions() throws Exception {
    String name = "remove-" + suffix;
    long v1 = createProject(alice, name);
    long v2 = createVersion(alice, v1, name, 2);
    addMember(alice, v2, mallory).andExpect(status().isOk());

    removeMember(alice, v2, mallory).andExpect(status().isNoContent());

    assertThat(membershipIds(v1)).hasSize(1);
    assertThat(membershipIds(v2)).hasSize(1);
    for (long id : List.of(v1, v2)) {
      mockMvc
          .perform(get("/projects/{id}", id).header("Authorization", bearer(mallory)))
          .andExpect(status().isNotFound());
      mockMvc
          .perform(get("/projects/{id}", id).header("Authorization", bearer(alice)))
          .andExpect(status().isOk());
    }
  }

  @Test
  void memberCanLeaveAProjectThatOthersKeep() throws Exception {
    long id = createProject(alice, "leave-" + suffix);
    addMember(alice, id, mallory).andExpect(status().isOk());

    removeMember(mallory, id, mallory).andExpect(status().isNoContent());

    mockMvc
        .perform(get("/projects/{id}", id).header("Authorization", bearer(mallory)))
        .andExpect(status().isNotFound());
    mockMvc
        .perform(get("/projects/{id}", id).header("Authorization", bearer(alice)))
        .andExpect(status().isOk());
  }

  @Test
  void lastActiveMemberCannotBeRemoved() throws Exception {
    long id = createProject(alice, "last-" + suffix);

    removeMember(alice, id, alice)
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("LAST_MEMBER"));
    assertThat(membershipIds(id)).hasSize(1);

    // A member whose account was deleted cannot open the project, so they don't count.
    addMember(alice, id, mallory).andExpect(status().isOk());
    jdbcTemplate.update("UPDATE app_users SET deleted_at = now() WHERE username = ?", mallory);

    removeMember(alice, id, alice).andExpect(status().isConflict());
    assertThat(membershipIds(id)).hasSize(2);
  }

  @Test
  void nonMemberCannotRemoveUsersAndNonMembersCannotBeRemoved() throws Exception {
    long id = createProject(alice, "remove-guard-" + suffix);
    List<Long> before = membershipIds(id);

    removeMember(mallory, id, alice).andExpect(status().isNotFound());
    removeMember(alice, id, mallory).andExpect(status().isNotFound());

    assertThat(membershipIds(id)).isEqualTo(before);
  }

  // --- validation ---

  @Test
  void putRejectsComponentsThatBreakValidationRules() throws Exception {
    long id = createProject(mallory, "validation-" + suffix);
    String name = "validation-" + suffix;

    Map<String, Object> completionTooHigh = component("Too done");
    completionTooHigh.put("degreeOfCompletion", 1.5);
    Map<String, Object> multiplierTooLow = component("Multiplier");
    multiplierTooLow.put("functionalMultiplier", 0);
    Map<String, Object> invalidSubComponent = component("Parent");
    Map<String, Object> badChild = component("Child");
    badChild.put("degreeOfCompletion", -0.1);
    invalidSubComponent.put("subComponents", List.of(badChild));

    for (var invalid : List.of(completionTooHigh, multiplierTooLow, invalidSubComponent)) {
      mockMvc
          .perform(
              put("/projects/{id}", id)
                  .header("Authorization", bearer(mallory))
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(body(name, 1, getProject(mallory, id), List.of(invalid), Set.of())))
          .andExpect(status().isBadRequest());
    }
    assertThat(getProject(mallory, id).get("functionalComponents")).isEmpty();
  }

  // --- archived versions ---

  @Test
  void archivedVersionsCannotBeEditedThroughTheApi() throws Exception {
    String name = "versioned-" + suffix;
    long v1 = createProject(mallory, name);
    long componentId = addComponent(mallory, v1, component("Kept")).path("id").asLong();
    long v2 = createVersion(mallory, v1, name, 2);

    // PUT
    JsonNode archived = getProject(mallory, v1);
    mockMvc
        .perform(
            put("/projects/{id}", v1)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(name, 1, archived, List.of(), Set.of(), "edited notes")))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("NOT_LATEST_VERSION"));
    // component endpoints
    mockMvc
        .perform(
            post("/functional-components/projects/{id}", v1)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(component("Late addition"))))
        .andExpect(status().isConflict());
    mockMvc
        .perform(
            delete("/functional-components/{cid}/projects/{id}", componentId, v1)
                .header("Authorization", bearer(mallory)))
        .andExpect(status().isConflict());
    // a new version can only be started from the latest one
    mockMvc
        .perform(
            post("/projects/{id}/versions", v1)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(name, 3, archived, List.of(), Set.of())))
        .andExpect(status().isConflict());

    JsonNode after = getProject(mallory, v1);
    assertThat(after.path("reportNotes").isNull()).isTrue();
    assertThat(after.path("functionalComponents")).hasSize(1);
    assertThat(v2).isNotEqualTo(v1);
  }

  @Test
  void versionNumberCannotBeChangedByPut() throws Exception {
    String name = "renumber-" + suffix;
    long id = createProject(mallory, name);

    mockMvc
        .perform(
            put("/projects/{id}", id)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(name, 7, getProject(mallory, id), List.of(), Set.of())))
        .andExpect(status().isBadRequest());

    assertThat(getProject(mallory, id).path("version").asInt()).isEqualTo(1);
  }

  @Test
  void renamingTheLatestVersionRenamesArchivedVersions() throws Exception {
    String name = "rename-" + suffix;
    long v1 = createProject(mallory, name);
    long v2 = createVersion(mallory, v1, name, 2);
    String newName = "renamed-" + suffix;

    mockMvc
        .perform(
            put("/projects/{id}", v2)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(newName, 2, getProject(mallory, v2), List.of(), Set.of())))
        .andExpect(status().isOk());

    assertThat(getProject(mallory, v1).path("projectName").asText()).isEqualTo(newName);
  }

  // --- concurrent saves ---

  @Test
  void staleSaveIsRejectedInsteadOfOverwritingNewerChanges() throws Exception {
    String name = "locking-" + suffix;
    long id = createProject(mallory, name);
    JsonNode tabA = getProject(mallory, id);
    JsonNode tabB = getProject(mallory, id);

    // Tab A saves first.
    MvcResult saved =
        mockMvc
            .perform(
                put("/projects/{id}", id)
                    .header("Authorization", bearer(mallory))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body(name, 1, tabA, List.of(component("From tab A")), Set.of())))
            .andExpect(status().isOk())
            .andReturn();
    JsonNode response = objectMapper.readTree(saved.getResponse().getContentAsString());
    assertThat(response.path("lockVersion").asLong())
        .isGreaterThan(tabA.path("lockVersion").asLong());

    // Tab B still holds the old copy, so its save must not win.
    mockMvc
        .perform(
            put("/projects/{id}", id)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(name, 1, tabB, List.of(), Set.of(), "from tab B")))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("STALE_LOCK_VERSION"));
    assertThat(getProject(mallory, id).path("reportNotes").isNull()).isTrue();

    // A client that carries the returned lockVersion forward can keep saving.
    mockMvc
        .perform(
            put("/projects/{id}", id)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(name, 1, response, List.of(), Set.of(), "second save")))
        .andExpect(status().isOk());
  }

  @Test
  void putWithoutLockVersionIsRejected() throws Exception {
    String name = "no-lock-" + suffix;
    long id = createProject(mallory, name);

    Map<String, Object> request = new HashMap<>();
    request.put("projectName", name);
    request.put("version", 1);
    request.put("functionalComponents", List.of());

    mockMvc
        .perform(
            put("/projects/{id}", id)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void staleSaveIsRejectedAfterAnotherTabAddsAComponent() throws Exception {
    String name = "stale-add-" + suffix;
    long id = createProject(mallory, name);
    JsonNode tabA = getProject(mallory, id);

    postComponent(mallory, id, component("Added in tab B"));

    mockMvc
        .perform(
            put("/projects/{id}", id)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(name, 1, tabA, List.of(), Set.of(), "from tab A")))
        .andExpect(status().isConflict());
  }

  @Test
  void staleSaveIsRejectedAfterAnotherTabDeletesAComponent() throws Exception {
    String name = "stale-delete-" + suffix;
    long id = createProject(mallory, name);
    long componentId = addComponent(mallory, id, component("To delete")).path("id").asLong();
    JsonNode tabA = getProject(mallory, id);

    mockMvc
        .perform(
            delete("/functional-components/{cid}/projects/{id}", componentId, id)
                .header("Authorization", bearer(mallory)))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(
            put("/projects/{id}", id)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(name, 1, tabA, List.of(), Set.of(), "from tab A")))
        .andExpect(status().isConflict());
  }

  @Test
  void addingAComponentReturnsALockVersionTheNextSaveCanUse() throws Exception {
    String name = "add-then-save-" + suffix;
    long id = createProject(mallory, name);
    long before = getProject(mallory, id).path("lockVersion").asLong();

    JsonNode afterAdd = postComponent(mallory, id, component("First"));

    assertThat(afterAdd.path("lockVersion").asLong()).isGreaterThan(before);
    mockMvc
        .perform(
            put("/projects/{id}", id)
                .header("Authorization", bearer(mallory))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(name, 1, afterAdd, List.of(), Set.of(), "saved after add")))
        .andExpect(status().isOk());
  }

  // --- timestamps ---

  @Test
  void duplicatedProjectGetsFinnishLocalTimestamps() throws Exception {
    long id = createProject(mallory, "duplicate-" + suffix);

    MvcResult result =
        mockMvc
            .perform(post("/projects/{id}/duplicate", id).header("Authorization", bearer(mallory)))
            .andExpect(status().isOk())
            .andReturn();
    JsonNode duplicate = objectMapper.readTree(result.getResponse().getContentAsString());
    projectIds.add(duplicate.path("id").asLong());

    LocalDateTime finlandNow = LocalDateTime.now(ZoneId.of("Europe/Helsinki"));
    for (String field : List.of("createdAt", "versionCreatedAt", "updatedAt")) {
      assertThat(duplicate.path(field).isNull()).as(field + " is set").isFalse();
      LocalDateTime time = LocalDateTime.parse(duplicate.path(field).asText());
      assertThat(Duration.between(time, finlandNow).abs())
          .as(field)
          .isLessThan(Duration.ofMinutes(1));
    }
  }

  // --- duplicate naming ---

  @Test
  void duplicatingAgainPicksAFreeNameInsteadOfJoiningTheFirstCopysVersions() throws Exception {
    String name = "dupname-" + suffix;
    long id = createProject(mallory, name);

    String first = duplicate(id).path("projectName").asText();
    String second = duplicate(id).path("projectName").asText();
    String third = duplicate(id).path("projectName").asText();

    assertThat(first).isEqualTo(name + " - Copy");
    assertThat(second).isEqualTo(name + " - Copy 2");
    assertThat(third).isEqualTo(name + " - Copy 3");
  }

  // --- helpers ---

  private JsonNode duplicate(long id) throws Exception {
    MvcResult result =
        mockMvc
            .perform(post("/projects/{id}/duplicate", id).header("Authorization", bearer(mallory)))
            .andExpect(status().isOk())
            .andReturn();
    JsonNode duplicate = objectMapper.readTree(result.getResponse().getContentAsString());
    projectIds.add(duplicate.path("id").asLong());
    return duplicate;
  }

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
    return postComponent(username, projectId, component).path("functionalComponents").get(0);
  }

  /** Adds a component and returns the whole project from the response, like the frontend uses. */
  private JsonNode postComponent(String username, long projectId, Map<String, Object> component)
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
    return objectMapper.readTree(result.getResponse().getContentAsString());
  }

  private JsonNode getProject(String username, long id) throws Exception {
    MvcResult result =
        mockMvc
            .perform(get("/projects/{id}", id).header("Authorization", bearer(username)))
            .andExpect(status().isOk())
            .andReturn();
    return objectMapper.readTree(result.getResponse().getContentAsString());
  }

  private ResultActions addMember(String caller, long projectId, String newMember)
      throws Exception {
    return mockMvc.perform(
        post("/projects/{id}/users", projectId)
            .header("Authorization", bearer(caller))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("username", newMember))));
  }

  private ResultActions removeMember(String caller, long projectId, String member)
      throws Exception {
    long memberId =
        users.stream()
            .filter(u -> u.getUsername().equals(member))
            .findFirst()
            .orElseThrow()
            .getId();
    return mockMvc.perform(
        delete("/projects/{id}/users/{appUserId}", projectId, memberId)
            .header("Authorization", bearer(caller)));
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
