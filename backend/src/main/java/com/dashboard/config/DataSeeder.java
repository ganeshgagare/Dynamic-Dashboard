package com.dashboard.config;

import com.dashboard.model.Task;
import com.dashboard.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Configuration
public class DataSeeder {

    private static final String[] STATUSES = {"Completed", "Pending", "In Progress"};
    private static final String[] CATEGORIES = {"Development", "Design", "Marketing", "QA", "DevOps", "Analytics"};
    private static final String[] NAMES = {
        "API Integration", "UI Redesign", "Database Migration", "Performance Audit",
        "Security Review", "Feature Launch", "Bug Fix Sprint", "Code Refactor",
        "Load Testing", "Deployment Pipeline", "Documentation Update", "Mobile App",
        "Data Pipeline", "Dashboard Setup", "Auth Module", "Payment Gateway",
        "Notification System", "Search Feature", "Admin Panel", "Reporting Tool",
        "Cache Layer", "Microservices", "CI/CD Setup", "Log Aggregation", "A/B Testing",
        "SEO Optimization", "Cloud Migration", "API Gateway", "Webhook Integration", "SSO Setup"
    };

    @Bean
    CommandLineRunner seedData(TaskRepository repo) {
        return args -> {
            if (repo.count() > 0) return; // skip if data exists
            Random rng = new Random();
            LocalDate start = LocalDate.of(2025, 1, 1);
            List<Task> tasks = new java.util.ArrayList<>();
            for (int i = 0; i < 30; i++) {
                LocalDate date = start.plusDays(rng.nextInt(470));
                tasks.add(new Task(
                    NAMES[i % NAMES.length],
                    STATUSES[rng.nextInt(STATUSES.length)],
                    date,
                    CATEGORIES[rng.nextInt(CATEGORIES.length)],
                    100 + rng.nextInt(900)
                ));
            }
            repo.saveAll(tasks);
            System.out.println("✅ Seeded " + tasks.size() + " sample tasks.");
        };
    }
}
