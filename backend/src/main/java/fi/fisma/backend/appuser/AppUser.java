package fi.fisma.backend.appuser;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
@AllArgsConstructor
public class AppUser {
    @Id
    private Long id;
    private String username;
    private String password;
}
