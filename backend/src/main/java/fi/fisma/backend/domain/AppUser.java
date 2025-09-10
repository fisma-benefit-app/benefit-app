package fi.fisma.backend.domain;

import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppUser {
    @Id
    private Long id;
    private String username;
    private String password;
}
