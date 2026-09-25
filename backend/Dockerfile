FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
# Resolve dependencies in their own layer so source-only changes don't
# re-download them.
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
RUN chmod +x ./gradlew && ./gradlew --no-daemon dependencies > /dev/null
COPY src src
RUN ./gradlew --no-daemon bootJar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
