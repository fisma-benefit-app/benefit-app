package fi.fisma.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

  public static void main(String[] args) {
    SpringApplication.run(BackendApplication.class, args);
    System.out.println("\n===============================");
    System.out.println("SPRING BOOT APPLICATION STARTED");
    System.out.println("===============================\n");
  }
}
