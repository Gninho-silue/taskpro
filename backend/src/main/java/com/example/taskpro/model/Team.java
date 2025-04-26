package com.example.taskpro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "teams")
@Getter
@Setter
@ToString(exclude = {"leader", "members", "projects"})
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
public class Team extends BaseEntity {

    @Column(nullable = false)
    @Size(min = 3, max = 100)
    @EqualsAndHashCode.Include
    private String name;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id", nullable = false)
    @JsonIgnore
    private User leader;

    @ManyToMany(mappedBy = "teams")
    @JsonIgnore
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Project> projects = new HashSet<>();

    public void addMember(User user) {
        members.add(user);
        user.getTeams().add(this);
    }

    public void removeMember(User user) {
        members.remove(user);
        user.getTeams().remove(this);
    }
}