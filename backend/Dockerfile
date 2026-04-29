# =============================================================
#   SwissMedPreter Backend — multi-stage build
#   Stage 1: build the Spring Boot fat jar with Maven + JDK 21
#   Stage 2: run it on a slim JRE 21 image
# =============================================================

# ---- Build stage ---------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Copy pom first for better layer caching
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q -DskipTests package

# ---- Runtime stage -------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for runtime
RUN addgroup -S smp && adduser -S smp -G smp

COPY --from=build /build/target/*.jar /app/app.jar
RUN chown smp:smp /app/app.jar
USER smp

EXPOSE 8080

ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
