package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;

class JwtSigningKeyTest {

  private final SecurityConfig config = new SecurityConfig(null, null);

  private static RSAPrivateKey newPrivateKey() throws Exception {
    var generator = KeyPairGenerator.getInstance("RSA");
    generator.initialize(2048);
    return (RSAPrivateKey) generator.generateKeyPair().getPrivate();
  }

  private String tokenSignedWith(RSAPrivateKey privateKey) throws Exception {
    var claims =
        JwtClaimsSet.builder()
            .subject("alice")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(60))
            .build();
    return config
        .jwtEncoder(privateKey, config.publicKey(privateKey))
        .encode(JwtEncoderParameters.from(claims))
        .getTokenValue();
  }

  @Test
  void tokenSignedWithOwnKeyIsAccepted() throws Exception {
    var privateKey = newPrivateKey();
    var decoder = config.jwtDecoder(config.publicKey(privateKey));

    assertThat(decoder.decode(tokenSignedWith(privateKey)).getSubject()).isEqualTo("alice");
  }

  @Test
  void tokenSignedWithAnotherEnvironmentsKeyIsRejected() throws Exception {
    var productionDecoder = config.jwtDecoder(config.publicKey(newPrivateKey()));
    var testingToken = tokenSignedWith(newPrivateKey());

    assertThatThrownBy(() -> productionDecoder.decode(testingToken))
        .isInstanceOf(JwtException.class);
  }
}
