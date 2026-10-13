# Stage 1: Build application with Maven and Eclipse Temurin JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache Maven dependencies
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B

# Copy source code and build production package
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal, secure JRE 21 runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root dedicated application user
RUN addgroup -S freshcart && adduser -S freshcart -G freshcart

# Copy compiled jar from builder stage
COPY --from=builder /app/target/supermarket-cart-backend-*.jar app.jar

# Set file ownership to non-root user
RUN chown -R freshcart:freshcart /app

# Expose server port (documentary default, dynamically overridden by Render via $PORT)
EXPOSE 8080

# Configure production defaults
ENV SPRING_PROFILES_ACTIVE=prod \
    PORT=8080

# Health check using Spring Boot health endpoint with dynamic PORT support
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q -O - http://localhost:${PORT:-8080}/api/health || exit 1

# Execute container as unprivileged user
USER freshcart

# JVM execution parameters
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
