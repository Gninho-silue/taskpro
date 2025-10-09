package com.example.taskpro.controller;

import com.example.taskpro.dto.label.LabelCreateDTO;
import com.example.taskpro.model.Label;
import com.example.taskpro.model.Project;
import com.example.taskpro.model.Task;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.LabelRepository;
import com.example.taskpro.repository.ProjectRepository;
import com.example.taskpro.repository.TaskRepository;
import com.example.taskpro.repository.UserRepository;
import com.example.taskpro.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

import static org.hamcrest.CoreMatchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class LabelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private LabelRepository labelRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User testUser;
    private Project testProject;
    private Label testLabel;
    private Task testTask;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        // Créer un utilisateur de test
        testUser = User.builder()
                .email("test@example.com")
                .password(passwordEncoder.encode("password"))
                .firstname("Test")
                .lastname("User")
                .projects(new HashSet<>())
                .build();
        userRepository.save(testUser);

        // Créer un projet de test
        testProject = Project.builder()
                .name("Test Project")
                .description("Test Description")
                .owner(testUser)
                .members(new HashSet<>())
                .labels(new HashSet<>())
                .build();
        testProject.addMember(testUser);
        projectRepository.save(testProject);

        // Créer un label de test
        testLabel = Label.builder()
                .name("Test Label")
                .color("#FF5733")
                .tasks(new HashSet<>())
                .build();
        testLabel.setProject(testProject);
        labelRepository.save(testLabel);

        // Créer une tâche de test
        testTask = Task.builder()
                .title("Test Task")
                .description("Test Description")
                .project(testProject)
                .creator(testUser)
                .labels(new HashSet<>())
                .build();
        taskRepository.save(testTask);

        // Générer un token JWT
        jwtToken = jwtService.generateToken(testUser);
    }

    @Test
    void testCreateLabel() throws Exception {
        // Préparer les données pour la création d'un label
        LabelCreateDTO createDTO = new LabelCreateDTO();
        createDTO.setName("New Label");
        createDTO.setColor("#00FF00");
        createDTO.setProjectId(testProject.getId());

        // Exécuter la requête POST
        ResultActions response = mockMvc.perform(post("/labels")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(createDTO)));

        // Vérifier le résultat
        response.andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Label created successfully")))
                .andExpect(jsonPath("$.data.name", is("New Label")))
                .andExpect(jsonPath("$.data.color", is("#00FF00")));
    }

    @Test
    void testGetLabelById() throws Exception {
        // Exécuter la requête GET
        ResultActions response = mockMvc.perform(get("/labels/{id}", testLabel.getId())
                .header("Authorization", "Bearer " + jwtToken));

        // Vérifier le résultat
        response.andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Label fetched successfully")))
                .andExpect(jsonPath("$.data.name", is(testLabel.getName())))
                .andExpect(jsonPath("$.data.color", is(testLabel.getColor())));
    }

    @Test
    void testGetLabelsByProject() throws Exception {
        // Exécuter la requête GET
        ResultActions response = mockMvc.perform(get("/labels/project/{project-id}", testProject.getId())
                .header("Authorization", "Bearer " + jwtToken));

        // Vérifier le résultat
        response.andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Labels fetched successfully")))
                .andExpect(jsonPath("$.data[0].name", is(testLabel.getName())));
    }

    @Test
    void testUpdateLabel() throws Exception {
        // Préparer les données pour la mise à jour du label
        LabelCreateDTO updateDTO = new LabelCreateDTO();
        updateDTO.setName("Updated Label");
        updateDTO.setColor("#0000FF");
        updateDTO.setProjectId(testProject.getId());

        // Exécuter la requête PUT
        ResultActions response = mockMvc.perform(put("/labels/{id}", testLabel.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(updateDTO)));

        // Vérifier le résultat
        response.andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Label has been updated successfully")))
                .andExpect(jsonPath("$.data.name", is("Updated Label")))
                .andExpect(jsonPath("$.data.color", is("#0000FF")));
    }

    @Test
    void testAddLabelToTask() throws Exception {
        // Exécuter la requête POST
        ResultActions response = mockMvc.perform(post("/labels/{label-id}/tasks/{task-id}",
                testLabel.getId(), testTask.getId())
                .header("Authorization", "Bearer " + jwtToken));

        // Vérifier le résultat
        response.andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Label has been added to the task successfully")));
    }

    @Test
    void testRemoveLabelFromTask() throws Exception {
        // D'abord ajouter le label à la tâche
        testTask.addLabel(testLabel);
        taskRepository.save(testTask);

        // Exécuter la requête DELETE
        ResultActions response = mockMvc.perform(delete("/labels/{label-id}/tasks/{task-id}",
                testLabel.getId(), testTask.getId())
                .header("Authorization", "Bearer " + jwtToken));

        // Vérifier le résultat
        response.andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Label has been removed from the task successfully")));
    }

    @Test
    void testDeleteLabel() throws Exception {
        // Exécuter la requête DELETE
        ResultActions response = mockMvc.perform(delete("/labels/{id}", testLabel.getId())
                .header("Authorization", "Bearer " + jwtToken));

        // Vérifier le résultat
        response.andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Label deleted successfully")));
    }
}