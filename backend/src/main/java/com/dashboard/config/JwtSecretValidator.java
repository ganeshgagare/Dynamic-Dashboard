package com.dashboard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;

@Configuration
public class JwtSecretValidator {

    private static final String DEFAULT_SECRET =
            "ThisIsADefaultSecretKeyThatMustBeOverriddenInProduction!!";

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    private final Environment environment;

    public JwtSecretValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validate() {
        boolean isDev = Arrays.asList(environment.getActiveProfiles()).contains("dev");
        if (!isDev && DEFAULT_SECRET.equals(jwtSecret)) {
            throw new IllegalStateException(
                "JWT_SECRET is set to the insecure default value. " +
                "Please set the JWT_SECRET environment variable to a strong random secret " +
                "(minimum 32 characters) before starting the application in production.");
        }
        if (jwtSecret.length() < 32) {
            throw new IllegalStateException(
                "JWT_SECRET must be at least 32 characters long. " +
                "Current length: " + jwtSecret.length());
        }
    }
}
