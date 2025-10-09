package com.example.taskpro.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                contact = @Contact(
                        name = "Équipe TaskPro",
                        email = "support@taskpro.com",
                        url = "https://www.taskpro.com"
                ),
                description = "Documentation API pour TaskPro - Une application de gestion de tâches et projets",
                title = "TaskPro API",
                version = "1.0.0",
                license = @License(
                        name = "Apache 2.0",
                        url = "https://www.apache.org/licenses/LICENSE-2.0.html"
                ),
                termsOfService = "https://www.taskpro.com/terms"
        ),
        servers = {
                @Server(
                        description = "Environnement local",
                        url = "http://localhost:8081"
                ),
                @Server(
                        description = "Environnement de développement",
                        url = "https://dev.taskpro.com"
                ),
                @Server(
                        description = "Environnement de production",
                        url = "https://api.taskpro.com"
                )
        },
        security = {
                @SecurityRequirement(
                        name = "bearerAuth"
                )
        }
)
@SecurityScheme(
        name = "bearerAuth",
        description = "Authentification JWT - Entrez votre JWT token avec le préfixe Bearer: Bearer <JWT>",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
    
    /**
     * Personnalisation supplémentaire de l'OpenAPI
     * Ce bean permet d'ajouter des tags et des descriptions plus détaillées
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .tags(List.of(
                        new Tag().name("User Management").description("API pour la gestion des utilisateurs, incluant création, mise à jour et recherche"),
                        new Tag().name("Project Management").description("API pour la gestion des projets et de leurs membres"),
                        new Tag().name("Task Management").description("API pour la gestion des tâches, incluant assignation et suivi"),
                        new Tag().name("Task Attachments").description("API pour la gestion des pièces jointes aux tâches"),
                        new Tag().name("Notifications").description("API pour la gestion des notifications utilisateur"),
                        new Tag().name("Authentication").description("API pour l'authentification et la gestion des sessions")
                ));
    }
}