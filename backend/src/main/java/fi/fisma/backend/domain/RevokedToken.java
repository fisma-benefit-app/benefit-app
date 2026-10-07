package fi.fisma.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "revoked_tokens")
public class RevokedToken {

  @Id
  @Column(name = "jti", nullable = false)
  private String jti;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  protected RevokedToken() {}

  public RevokedToken(String jti, Instant expiresAt) {
    this.jti = jti;
    this.expiresAt = expiresAt;
  }

  public String getJti() {
    return jti;
  }

  public void setJti(String jti) {
    this.jti = jti;
  }

  public Instant getExpiresAt() {
    return expiresAt;
  }

  public void setExpiresAt(Instant expiresAt) {
    this.expiresAt = expiresAt;
  }
}
