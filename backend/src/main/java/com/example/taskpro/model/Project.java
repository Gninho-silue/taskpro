package com.example.taskpro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@SuperBuilder
@Table(name = "projects")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Project extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 1000)
    private String description;
    private boolean archived = false;


    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.PLANNING;

    private LocalDateTime startDate;
    private LocalDateTime dueDate;


    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToMany(mappedBy = "projects")
    @JsonIgnore
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Label> labels = new HashSet<>();



    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Task> tasks = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    public void addMember(User user) {
        this.members.add(user);
        user.getProjects().add(this);
    }

    public void removeMember(User user) {
        this.members.remove(user);
        user.getProjects().remove(this);
    }

    public void assignTeam(Team team) {
        this.team = team;
        if (team != null) {
            team.getProjects().add(this);
        }
    }

    public void unassignTeam() {
        if (this.team != null) {
            Team oldTeam = this.team;
            this.team = null;
            oldTeam.getProjects().remove(this);
        }
    }

    /**
     * Ajoute un label à ce projet
     */
    public void addLabel(Label label) {
        this.labels.add(label);
        if (label.getProject() != this) {
            label.setProject(this);
        }
    }

    /**
     * Supprime un label de ce projet
     */
    public void removeLabel(Label label) {
        this.labels.remove(label);
        if (label.getProject() == this) {
            label.setProject(null);
        }
    }


}
