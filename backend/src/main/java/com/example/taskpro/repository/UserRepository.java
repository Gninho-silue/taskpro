package com.example.taskpro.repository;

import com.example.taskpro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByEmailContainingOrFirstnameContainingOrLastnameContaining(String query, String query1, String query2);
}
