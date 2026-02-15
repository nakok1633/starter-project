# Build stage
FROM gradle:8.5-jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src ./src
RUN gradle build -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

COPY --from=build /app/build/libs/*.jar app.jar

# Change ownership
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
