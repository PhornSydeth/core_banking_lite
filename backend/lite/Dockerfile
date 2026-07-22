# Stage 1: Build the application
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app

# Copy configuration and source code
COPY pom.xml .
COPY src ./src

# Build the application and skip tests for speed
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the exact jar using your artifactID and version
COPY --from=build /app/target/lite-0.0.1-SNAPSHOT.jar app.jar

# Expose port and run the jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
