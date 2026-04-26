package com.example.taskpro.config;

import com.example.taskpro.model.*;
import com.example.taskpro.repository.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Seeds realistic dev data on first startup. Idempotent — skips if seed user exists.
 *
 * Accounts (all pre-verified, no email step needed):
 *   alex.dupont@taskpro.dev  / Dev@12345!  (ADMIN)
 *   marie.chen@taskpro.dev   / Dev@12345!  (TEAM_LEADER)
 *   lucas.martin@taskpro.dev / Dev@12345!  (USER)
 *
 * Note: entities are reloaded after save so Hibernate initialises lazy collection
 * proxies — @SuperBuilder does not apply field-level = new HashSet<>() defaults.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements ApplicationRunner {

    private final UserRepository    userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository    taskRepository;
    private final TeamRepository    teamRepository;
    private final LabelRepository   labelRepository;
    private final PasswordEncoder   passwordEncoder;
    private final EntityManager     em;

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

        // ── 1. Persist users (no collections set yet) ──────────────
        Long alexId  = userRepository.save(user("Alex",  "Dupont",  SEED_EMAIL,                  Role.ADMIN)).getId();
        Long marieId = userRepository.save(user("Marie", "Chen",    "marie.chen@taskpro.dev",    Role.TEAM_LEADER)).getId();
        Long lucasId = userRepository.save(user("Lucas", "Martin",  "lucas.martin@taskpro.dev",  Role.USER)).getId();

        // Flush + clear so findById reads from DB (not first-level cache) and gets
        // properly initialised Hibernate PersistentSet proxies instead of null.
        em.flush();
        em.clear();
        User alex  = userRepository.findById(alexId).orElseThrow();
        User marie = userRepository.findById(marieId).orElseThrow();
        User lucas = userRepository.findById(lucasId).orElseThrow();

        // ── 2. Team ────────────────────────────────────────────────
        Team guild = teamRepository.save(Team.builder()
                .name("Frontend Guild")
                .description("UI/UX and React specialists focused on design systems")
                .leader(marie)
                .build());

        // Manage team membership through the owning side (User.teams)
        alex.getTeams().add(guild);
        marie.getTeams().add(guild);
        lucas.getTeams().add(guild);
        userRepository.save(alex);
        userRepository.save(marie);
        userRepository.save(lucas);

        // ── 3. Projects ────────────────────────────────────────────
        Project ecommerce = projectRepository.save(Project.builder()
                .name("E-Commerce Redesign")
                .description("Full redesign of the storefront and checkout flow")
                .status(ProjectStatus.IN_PROGRESS)
                .startDate(LocalDateTime.of(2026, 3, 1, 0, 0))
                .dueDate(LocalDateTime.of(2026, 6, 30, 0, 0))
                .owner(alex)
                .team(guild)
                .build());

        Project apiGateway = projectRepository.save(Project.builder()
                .name("API Gateway")
                .description("Migrate to new API gateway with rate limiting")
                .status(ProjectStatus.IN_PROGRESS)
                .startDate(LocalDateTime.of(2026, 2, 1, 0, 0))
                .dueDate(LocalDateTime.of(2026, 5, 15, 0, 0))
                .owner(alex)
                .build());

        // Reload users again after team saves to get fresh state, then add projects
        em.flush();
        em.clear();
        alex  = userRepository.findById(alexId).orElseThrow();
        marie = userRepository.findById(marieId).orElseThrow();
        lucas = userRepository.findById(lucasId).orElseThrow();

        // Manage project membership through the owning side (User.projects)
        alex.getProjects().add(ecommerce);
        alex.getProjects().add(apiGateway);
        marie.getProjects().add(ecommerce);
        lucas.getProjects().add(ecommerce);
        lucas.getProjects().add(apiGateway);
        userRepository.save(alex);
        userRepository.save(marie);
        userRepository.save(lucas);

        // ── 4. Labels ──────────────────────────────────────────────
        labelRepository.save(Label.builder().name("Frontend").color("#10b981").project(ecommerce).build());
        labelRepository.save(Label.builder().name("Backend").color("#f59e0b").project(ecommerce).build());
        labelRepository.save(Label.builder().name("Urgent").color("#ef4444").project(ecommerce).build());
        labelRepository.save(Label.builder().name("Backend").color("#f59e0b").project(apiGateway).build());

        // ── 5. Tasks ───────────────────────────────────────────────
        taskRepository.save(task("Design login screen mockups",
                "Create hi-fi mockups for the authentication flow in Figma.",
                TaskStatus.DONE, TaskPriority.HIGH, 2026, 4, 20, 8, 7, ecommerce, alex, alex));

        taskRepository.save(task("Implement product listing page",
                "Build the product grid with filters, sorting, and pagination. Integrate with the catalog API.",
                TaskStatus.IN_PROGRESS, TaskPriority.HIGH, 2026, 4, 28, 16, 10, ecommerce, alex, marie));

        taskRepository.save(task("Checkout flow API integration",
                "Connect the payment gateway and order management endpoints. Handle success, failure, and webhook callbacks.",
                TaskStatus.IN_PROGRESS, TaskPriority.URGENT, 2026, 4, 26, 20, 12, ecommerce, alex, alex));

        taskRepository.save(task("Write unit tests for cart service",
                "Cover edge cases: empty cart, max quantity, discount codes, session expiry.",
                TaskStatus.TODO, TaskPriority.MEDIUM, 2026, 5, 5, 10, 0, ecommerce, alex, null));

        taskRepository.save(task("Set up CI/CD pipeline",
                "Configure GitHub Actions for automated build, test, and deploy workflows.",
                TaskStatus.IN_REVIEW, TaskPriority.HIGH, 2026, 4, 25, 12, 14, ecommerce, alex, marie));

        taskRepository.save(task("Mobile responsive fixes",
                "Fix layout issues on small viewports (320px–375px) identified in the QA report.",
                TaskStatus.IN_REVIEW, TaskPriority.HIGH, 2026, 4, 27, 6, 5, ecommerce, marie, alex));

        taskRepository.save(task("Rate limiter implementation",
                "Implement sliding window rate limiter with per-user and per-IP limits backed by Redis.",
                TaskStatus.IN_PROGRESS, TaskPriority.URGENT, 2026, 5, 1, 12, 6, apiGateway, alex, lucas));

        taskRepository.save(task("JWT validation middleware",
                "Add JWT validation at the gateway level to offload auth from downstream services.",
                TaskStatus.TODO, TaskPriority.HIGH, 2026, 5, 10, 8, 0, apiGateway, alex, alex));

        log.info("[DataLoader] Done — 3 users, 1 team, 2 projects, 8 tasks created");
        log.info("[DataLoader] Login: {} / {}", SEED_EMAIL, PASSWORD);
    }

    // ── Helpers ────────────────────────────────────────────────────
    private User user(String first, String last, String email, Role role) {
        return User.builder()
                .firstname(first).lastname(last).email(email)
                .password(passwordEncoder.encode(PASSWORD))
                .role(role).enabled(true)
                .build();
    }

    private Task task(String title, String desc, TaskStatus status, TaskPriority priority,
                      int year, int month, int day, int estimated, int actual,
                      Project project, User creator, User assignee) {
        return Task.builder()
                .title(title).description(desc)
                .status(status).priority(priority)
                .dueDate(LocalDateTime.of(year, month, day, 0, 0))
                .estimatedHours(estimated).actualHours(actual)
                .project(project).creator(creator).assignee(assignee)
                .build();
    }
}
