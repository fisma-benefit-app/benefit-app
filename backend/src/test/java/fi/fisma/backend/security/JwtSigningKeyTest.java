package fi.fisma.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import fi.fisma.backend.config.InvalidConfigurationException;
import fi.fisma.backend.domain.AppUser;
import fi.fisma.backend.repository.AppUserRepository;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;

class JwtSigningKeyTest {

  private final SecurityConfig config = new SecurityConfig(null, null);
  private final MockEnvironment defaultProfile = new MockEnvironment();

  private static RSAPrivateKey newPrivateKey() throws Exception {
    var generator = KeyPairGenerator.getInstance("RSA");
    generator.initialize(2048);
    return (RSAPrivateKey) generator.generateKeyPair().getPrivate();
  }

  private static String devPrivateKey() {
    var yaml = new YamlPropertiesFactoryBean();
    yaml.setResources(new ClassPathResource("application-dev.yaml"));
    return yaml.getObject().getProperty("jwt.dev-private-key");
  }

  private String tokenSignedWith(RSAPrivateKey privateKey) throws Exception {
    var claims =
        JwtClaimsSet.builder()
            .subject("alice")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(60))
            .build();
    return config
        .jwtEncoder(privateKey, config.publicKey(privateKey, defaultProfile))
        .encode(JwtEncoderParameters.from(claims))
        .getTokenValue();
  }

  private AppUserRepository users() {
    var repository = mock(AppUserRepository.class);
    when(repository.findByUsernameActive("alice")).thenReturn(Optional.of(new AppUser()));
    return repository;
  }

  @Test
  void tokenSignedWithOwnKeyIsAccepted() throws Exception {
    var privateKey = newPrivateKey();
    var decoder = config.jwtDecoder(config.publicKey(privateKey, defaultProfile), users());

    assertThat(decoder.decode(tokenSignedWith(privateKey)).getSubject()).isEqualTo("alice");
  }

  @Test
  void tokenSignedWithAnotherEnvironmentsKeyIsRejected() throws Exception {
    var productionDecoder =
        config.jwtDecoder(config.publicKey(newPrivateKey(), defaultProfile), users());
    var testingToken = tokenSignedWith(newPrivateKey());

    assertThatThrownBy(() -> productionDecoder.decode(testingToken))
        .isInstanceOf(JwtException.class);
  }

  @Test
  void devKeyIsUsedWhenJwtPrivateKeyIsBlank() throws Exception {
    var privateKey = config.privateKey("", devPrivateKey());
    var devProfile = new MockEnvironment();
    devProfile.setActiveProfiles("dev");

    assertThat(SecurityConfig.fingerprint(config.publicKey(privateKey, devProfile)))
        .isEqualTo(SecurityConfig.DEV_KEY_FINGERPRINT);
  }

  @Test
  void devKeyIsRejectedOutsideDevProfile() {
    var privateKey = config.privateKey(devPrivateKey(), "");

    assertThatThrownBy(() -> config.publicKey(privateKey, defaultProfile))
        .isInstanceOf(InvalidConfigurationException.class)
        .hasMessageContaining("public dev key");
  }
}
