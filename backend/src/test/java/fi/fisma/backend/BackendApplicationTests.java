package fi.fisma.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

    @MockitoBean
    private JwtEncoder jwtEncoder;

    @Test
    void contextLoads() {
    }
    
}
