package fi.fisma.backend.appuser;

import org.springframework.data.annotation.Id;

public class AppUser {
   @Id
   private Long id;
   private String username;
   private String password;
}
