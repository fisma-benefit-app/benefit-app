package fi.fisma.backend.security;

import static java.nio.charset.StandardCharsets.UTF_8;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.regex.Pattern;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NewPassword.Validator.class)
public @interface NewPassword {
  String message() default
      "New password must be nonblank, contain 8 to 72 Unicode characters, and fit within 72 UTF-8"
          + " bytes. Null characters and line breaks are unsupported.";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};

  class Validator implements ConstraintValidator<NewPassword, String> {
    private static final Pattern BLANK = Pattern.compile("[\\x00-\\x20\\p{IsWhite_Space}]*");

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
      if (password == null) {
        return false;
      }
      int characters = password.codePointCount(0, password.length());
      return characters >= 8
          && characters <= 72
          && !BLANK.matcher(password).matches()
          // BCrypt can match a shorter password when the replacement contains NULs.
          && password.indexOf('\0') == -1
          // Browser password fields strip carriage returns and line feeds.
          && password.indexOf('\r') == -1
          && password.indexOf('\n') == -1
          // UTF-8 encoding would otherwise replace unpaired surrogates.
          && UTF_8.newEncoder().canEncode(password)
          && password.getBytes(UTF_8).length <= 72;
    }
  }
}
