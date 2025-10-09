package com.example.taskpro.service;

import com.example.taskpro.dto.user.UserBasicDTO;
import com.example.taskpro.dto.user.UserCreateDTO;
import com.example.taskpro.exception.OperationNotPermittedException;
import com.example.taskpro.model.Role;
import com.example.taskpro.model.User;
import com.example.taskpro.exception.ResourceNotFoundException;
import com.example.taskpro.mapper.UserMapper;
import com.example.taskpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.example.taskpro.util.SecurityUtil.getConnectedUser;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    /**
     * Récupère un utilisateur par son ID
     */
    @Transactional(readOnly = true)
    public UserBasicDTO getUserById(Long id) {
        User user = findUserOrThrow(id);
        return userMapper.toBasicDto(user);
    }

    public UserBasicDTO getCurrentUser(Authentication authentication) {

       User user =  getConnectedUser(authentication, userRepository);
       return userMapper.toBasicDto(user);
    }
    
    /**
     * Récupère un utilisateur par son email
     */
    @Transactional(readOnly = true)
    public UserBasicDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userMapper.toBasicDto(user);
    }
    
    /**
     * Met à jour les informations d'un utilisateur
     */
    @Transactional
    public UserBasicDTO updateUser(Long userId, UserCreateDTO dto) {
        User user = findUserOrThrow(userId);

        // Mettre à jour les informations de l'utilisateur
        if (dto.getFirstname() != null) {
            user.setFirstname(dto.getFirstname());
        }
        
        if (dto.getLastname() != null) {
            user.setLastname(dto.getLastname());
        }
        
        if (dto.getDateOfBirth() != null) {
            user.setDateOfBirth(dto.getDateOfBirth());
        }
        
        if (dto.getPreferredLanguage() != null) {
            user.setPreferredLanguage(dto.getPreferredLanguage());
        }
        
        if (dto.getProfileImage() != null) {
            user.setProfileImage(dto.getProfileImage());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return userMapper.toBasicDto(updatedUser);
    }

    /**
     * Désactive un compte utilisateur
     */
    @Transactional
    public void setAccountDisable(Long id, boolean disabled, Authentication authentication) {
        User user = findUserOrThrow(id);

        User connectedUser = getConnectedUser(authentication, userRepository);
        if (connectedUser.getRole() != Role.ADMIN) {
            throw new OperationNotPermittedException("Only admins can disable users.");
        }
        user.setEnabled(disabled);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    /**
     * Verrouille ou déverrouille un compte utilisateur
     */
    @Transactional
    public void setAccountLock(Long userId, boolean locked) {
        User user = findUserOrThrow(userId);
        user.setAccountLocked(locked);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Recherche des utilisateurs
     */
    @Transactional(readOnly = true)
    public List<UserBasicDTO> searchUsers(String query) {
        List<User> users = userRepository.findByEmailContainingOrFirstnameContainingOrLastnameContaining(
                query, query, query);
        return users.stream()
                .map(userMapper::toBasicDto)
                .collect(Collectors.toList());
    }

    /**
     * Change le rôle d'un utilisateur
     */
    @Transactional
    public void changeUserRole(Long userId, Role newRole, Authentication authentication) {
        User user = findUserOrThrow(userId);
        User connectedUser = getConnectedUser(authentication, userRepository);
        if (connectedUser.getRole() != Role.ADMIN) {
            throw new OperationNotPermittedException("Only admins can change user roles");
        }

        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Met à jour les préférences linguistiques de l'utilisateur
     */
    @Transactional
    public void updateLanguagePreference(Long userId, String language) {
        User user = findUserOrThrow(userId);

        user.setPreferredLanguage(language);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }


    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

}