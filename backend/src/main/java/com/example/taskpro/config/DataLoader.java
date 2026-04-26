package com.example.taskpro.config;

import com.example.taskpro.model.*;
import com.example.taskpro.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Seeds the database with realistic dev data on every startup.
 * Skipped automatically if the seed user already exists — safe to restart.
 *
 * Accounts created (all pre-verified, no email needed):
 *   alex.dupont@taskpro.dev  / Dev@12345!  (ADMIN)
 *   marie.chen@taskpro.dev   / Dev@12345!  (TEAM_LEADER)
 *   lucas.martin@taskpro.dev / Dev@12345!  (USER)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements ApplicationRunner {

    private final UserRepository        userRepository;
    private final ProjectRepository     projectRepository;
    private final TaskRepository        taskRepository;
    private final TeamRepository        teamRepository;
    private final LabelRepository       labelRepository;
    private final PasswordEncoder       passwordEncoder;

    private static final String SEED_EMAIL = "alex.dupont@taskpro.dev";
    private static final String PASSWORD   = "Dev@12345!";

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail(SEED_EMAIL).isPresent()) {
            log.info("[DataLoader] Seed data already present — skipping");
            return;
        }

        log.info("[DataLoader] Seeding database…");

        // ── Users ──────────────────────────────────────────────────
        User alex = userRepository.save(User.builder()
                .firstname("Alex").lastname("Dupont")
                .email(SEED_EMAIL)
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.ADMIN)
                .enabled(true)
                .build());

        User marie = userRepository.save(User.builder()
                .firstname("Marie").lastname("Chen")
                .email("marie.chen@taskpro.dev")
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.TEAM_LEADER)
                .enabled(true)
                .build());

        User lucas = userRepository.save(User.builder()
                .firstname("Lucas").lastname("Martin")
                .email("lucas.martin@taskpro.dev")
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.USER)
                .enabled(true)
                .build());

        // ── Team ───────────────────────────────────────────────────
        Team frontendGuild = teamRepository.save(Team.builder()
                .name("Frontend Guild")
                .description("UI/UX and React specialists focused on design systems")
                .leader(marie)
                .build());
        frontendGuild.addMember(alex);
        frontendGuild.addMember(marie);
        frontendGuild.addMember(lucas);
        teamRepository.save(frontendGuild);

        // ── Projects ───────────────────────────────────────────────
        Project ecommerce = Project.builder()
                .name("E-Commerce Redesign")
                .description("Full redesign of the storefront and checkout flow")
                .status(ProjectStatus.IN_PROGRESS)
                .startDate(LocalDateTime.of(2026, 3, 1, 0, 0))
                .dueDate(LocalDateTime.of(2026, 6, 30, 0, 0))
                .owner(alex)
                .build();
        ecommerce.addMember(alex);
        ecommerce.addMember(marie);
        ecommerce.addMember(lucas);
        ecommerce.assignTeam(frontendGuild);
        projectRepository.save(ecommerce);

        Project apiGateway = Project.builder()
                .name("API Gateway")
                .description("Migrate to new API gateway with rate limiting")
                .status(ProjectStatus.IN_PROGRESS)
                .startDate(LocalDateTime.of(2026, 2, 1, 0, 0))
                .dueDate(LocalDateTime.of(2026, 5, 15, 0, 0))
                .owner(alex)
                .build();
        apiGateway.addMember(alex);
        apiGateway.addMember(lucas);
        projectRepository.save(apiGateway);

        // ── Labels ─────────────────────────────────────────────────
        labelRepository.save(Label.builder().name("Frontend").color("#10b981").project(ecommerce).build());
        labelRepository.save(Label.builder().name("Backend").color("#f59e0b").project(ecommerce).build());
        labelRepository.save(Label.builder().name("Urgent").color("#ef4444").project(ecommerce).build());
        labelRepository.save(Label.builder().name("Backend").color("#f59e0b").project(apiGateway).build());

        // ── Tasks — E-Commerce ─────────────────────────────────────
        taskRepository.save(Task.builder()
                .title("Design login screen mockups")
                .description("Create hi-fi mockups for the authentication flow in Figma, including login, register, and password reset screens.")
                .status(TaskStatus.DONE)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDateTime.of(2026, 4, 20, 0, 0))
                .estimatedHours(8).actualHours(7)
                .project(ecommerce).creator(alex).assignee(alex)
                .build());

        taskRepository.save(Task.builder()
                .title("Implement product listing page")
                .description("Build the product grid with filters, sorting, and pagination. Integrate with the catalog API.")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDateTime.of(2026, 4, 28, 0, 0))
                .estimatedHours(16).actualHours(10)
                .project(ecommerce).creator(alex).assignee(marie)
                .build());

        taskRepository.save(Task.builder()
                .title("Checkout flow API integration")
                .description("Connect the payment gateway and order management endpoints. Handle success, failure, and webhook callbacks.")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.URGENT)
                .dueDate(LocalDateTime.of(2026, 4, 26, 0, 0))
                .estimatedHours(20).actualHours(12)
                .project(ecommerce).creator(alex).assignee(alex)
                .build());

        taskRepository.save(Task.builder()
                .title("Write unit tests for cart service")
                .description("Cover edge cases for cart state management including empty cart, max quantity, discount codes, and session expiry.")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.MEDIUM)
                .dueDate(LocalDateTime.of(2026, 5, 5, 0, 0))
                .estimatedHours(10).actualHours(0)
                .project(ecommerce).creator(alex).assignee(null)
                .build());

        taskRepository.save(Task.builder()
                .title("Set up CI/CD pipeline")
                .description("Configure GitHub Actions for automated build, test, and deploy workflows. Add branch protection rules.")
                .status(TaskStatus.IN_REVIEW)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDateTime.of(2026, 4, 25, 0, 0))
                .estimatedHours(12).actualHours(14)
                .project(ecommerce).creator(alex).assignee(marie)
                .build());

        taskRepository.save(Task.builder()
                .title("Mobile responsive fixes")
                .description("Fix layout issues on small viewports (320px–375px) identified in the QA report.")
                .status(TaskStatus.IN_REVIEW)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDateTime.of(2026, 4, 27, 0, 0))
                .estimatedHours(6).actualHours(5)
                .project(ecommerce).creator(marie).assignee(alex)
                .build());

        // ── Tasks — API Gateway ────────────────────────────────────
        taskRepository.save(Task.builder()
                .title("Rate limiter implementation")
                .description("Implement sliding window rate limiter for the API gateway. Support per-user and per-IP limits with Redis backing.")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.URGENT)
                .dueDate(LocalDateTime.of(2026, 5, 1, 0, 0))
                .estimatedHours(12).actualHours(6)
                .project(apiGateway).creator(alex).assignee(lucas)
                .build());

        taskRepository.save(Task.builder()
                .title("JWT validation middleware")
                .description("Add JWT validation at the gateway level to offload auth from downstream services.")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDateTime.of(2026, 5, 10, 0, 0))
                .estimatedHours(8).actualHours(0)
                .project(apiGateway).creator(alex).assignee(alex)
                .build());

        log.info("[DataLoader] Done — 3 users, 2 projects, 1 team, 8 tasks created");
        log.info("[DataLoader] Login: {} / {}", SEED_EMAIL, PASSWORD);
    }
}
