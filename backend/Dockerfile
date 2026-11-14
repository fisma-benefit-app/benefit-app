FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew && ./gradlew clean bootJar

FROM eclipse-temurin:21-jre
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --only-upgrade \
        libc6 libc-bin libc-gconv-modules-extra locales \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
