package com.example.taskpro.service;

import com.example.taskpro.dto.team.TeamBasicDTO;
import com.example.taskpro.mapper.TeamMapper;
import com.example.taskpro.model.Team;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.ProjectRepository;
import com.example.taskpro.repository.TeamRepository;
import com.example.taskpro.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeamMapper teamMapper;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TeamService teamService;

    @BeforeEach
    void setUp() {
        // Setup leader
        User leader = User.builder()
                .id(1L)
                .firstname("John")
                .lastname("Doe")
                .email("john@example.com")
                .teams(new HashSet<>())
                .build();

        // Setup member
        User member = User.builder()
                .id(2L)
                .firstname("Jane")
                .lastname("Smith")
                .email("jane@example.com")
                .teams(new HashSet<>())
                .build();

        // Setup team
        Team team = Team.builder()
                .id(1L)
                .name("Test Team")
                .description("Test Description")
                .leader(leader)
                .members(new HashSet<>())
                .projects(new HashSet<>())
                .build();

        // Setup teamDTO
        TeamBasicDTO teamDTO = TeamBasicDTO.builder()
                .id(1L)
                .name("Test Team")
                .description("Test Description")
                .build();

        // Mock repository methods
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(userRepository.findById(2L)).thenReturn(Optional.of(member));
        when(teamMapper.toBasicDto(any(Team.class))).thenReturn(teamDTO);
        when(authentication.getName()).thenReturn("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(leader));
    }

    @Test
    void testAddMemberToTeam() {
        System.out.println("[DEBUG_LOG] Starting testAddMemberToTeam");
        
        // Test adding a member to a team
        TeamBasicDTO result = teamService.addMemberToTeam(1L, 2L, authentication);
        
        System.out.println("[DEBUG_LOG] Successfully added member to team");
        assertNotNull(result);
        System.out.println("[DEBUG_LOG] Test completed successfully");
    }
}