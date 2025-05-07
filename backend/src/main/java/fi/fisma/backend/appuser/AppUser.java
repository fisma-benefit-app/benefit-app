package fi.fisma.backend.appuser;

import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AppUser {
    @Id
    private Long id;
    private String username;
    private String password;
}
