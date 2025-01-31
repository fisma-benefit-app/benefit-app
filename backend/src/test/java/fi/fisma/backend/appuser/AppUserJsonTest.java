package fi.fisma.backend.appuser;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

import static org.assertj.core.api.Assertions.assertThat;

@JsonTest
class AppUserJsonTest {
    
    @Autowired
    private JacksonTester<AppUser> json;
    
    private AppUser user;
    
    @BeforeEach
    void setUp() {
        user = new AppUser(1L, "Pekka", "1234");
    }
    
    @Test
    void userSerializationTest() throws Exception {

        assertThat(json.write(user)).isEqualToJson("/json-examples/appuser.json");
        assertThat(json.write(user)).hasJsonPathNumberValue("@.id");
        assertThat(json.write(user)).hasJsonPathStringValue("@.username");
        assertThat(json.write(user)).hasJsonPathStringValue("@.password");
        assertThat(json.write(user)).extractingJsonPathNumberValue("@.id").isEqualTo(1);
        assertThat(json.write(user)).extractingJsonPathStringValue("@.username").isEqualTo("Pekka");
        assertThat(json.write(user)).extractingJsonPathStringValue("@.password").isEqualTo("1234");
    }
    
    @Test
    void userDeserializationTest() throws Exception {
        String expected = """
                {
                  "id": 1,
                  "username": "Pekka",
                  "password": "1234"
                }
                """;
        
        assertThat(json.parse(expected)).isEqualTo(user);
        assertThat(json.parseObject(expected).getId()).isEqualTo(1);
        assertThat(json.parseObject(expected).getUsername()).isEqualTo("Pekka");
        assertThat(json.parseObject(expected).getPassword()).isEqualTo("1234");
    }
}

