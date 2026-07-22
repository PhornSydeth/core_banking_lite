# Stage 1: Build the Maven application
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the package and skip tests to speed up the Render deployment
RUN mvn clean package -DskipTests

# Stage 2: Run the built JAR file
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR from the first stage
# Note: Ensure your target filename matches your pom.xml artifactId/version
COPY --from=build /app/target/lite-0.0.1-SNAPSHOT.jar app.jar

# Expose the dynamic port Render provides
EXPOSE 8080

# Run the spring boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
