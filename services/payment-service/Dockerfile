FROM eclipse-temurin:17-jdk-jammy

# Set working directory
WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy Maven wrapper
COPY mvnw .

# Copy pom.xml
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build application
RUN mvn clean package -DskipTests

# Create final image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy jar from build stage
COPY --from=0 /app/target/payment-service-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8004

ENV STRIPE_PUBLISHABLE_KEY="pk_test_51TGceUAB5p82gWkOgQm2ELtfrrHMGTdwAokvOV9Sbr8OdXblmXRYyOBDb10cZ6Vvxo40kaMq4GzVXZDvJzUuIEbO00vSFtMhhy"
ENV STRIPE_API_KEY="sk_test_51TGceUAB5p82gWkOS3nqFXQWrG1R0efM2fQpgkUETJotXsm4q1kmJ7dvXiPlbptIE7ZFHBnngRQxQinwbUkllpJQ00EYrRTsPS"
ENV STRIPE_WEBHOOK_SECRET="rk_test_51TGceUAB5p82gWkO7YzYyzr4E0cN6dLpzCzSmhR4AbKShRy9RtdpA3FFNwd2FmR0wXNE6nYsigSdUYj3gQGNsrPk00FVjeICcX"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:8004/api/v1/payments/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
