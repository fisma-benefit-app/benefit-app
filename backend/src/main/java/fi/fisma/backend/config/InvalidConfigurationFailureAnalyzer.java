package fi.fisma.backend.config;

import org.springframework.boot.diagnostics.AbstractFailureAnalyzer;
import org.springframework.boot.diagnostics.FailureAnalysis;

/**
 * Reports an {@link InvalidConfigurationException} anywhere in a startup failure's cause chain as a
 * Description/Action pair. Registered in {@code META-INF/spring.factories}.
 */
public class InvalidConfigurationFailureAnalyzer
    extends AbstractFailureAnalyzer<InvalidConfigurationException> {

  @Override
  protected FailureAnalysis analyze(Throwable rootFailure, InvalidConfigurationException cause) {
    return new FailureAnalysis(cause.getDescription(), cause.getAction(), cause);
  }
}
