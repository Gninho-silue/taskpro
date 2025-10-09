package com.example.taskpro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "labels")
@Getter
@Setter
@ToString(exclude = {"project", "tasks"})
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
public class Label extends BaseEntity {

    @NotBlank
    @Size(min = 2, max = 50)
    @Column(nullable = false)
    @EqualsAndHashCode.Include
    private String name;

    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnore
    private Project project;

    @ManyToMany(mappedBy = "labels")
    @JsonIgnore
    private Set<Task> tasks = new HashSet<>();



    /**
     * Définit le projet associé à ce label et met à jour la relation bidirectionnelle
     */
    public void setProject(Project project) {
        // Enlever de l'ancien projet si présent
        if (this.project != null && !this.project.equals(project)) {
            this.project.getLabels().remove(this);
        }

        this.project = project;

        // Ajouter au nouveau projet si présent
        if (project != null) {
            project.getLabels().add(this);
        }
    }

    /**
     * Supprime l'association avec le projet actuel
     */
    public void removeFromProject() {
        if (this.project != null) {
            Project currentProject = this.project;
            this.project = null;
            currentProject.getLabels().remove(this);
        }
    }

    /**
     * Ajoute une tâche à ce label
     */
    public void addTask(Task task) {
        this.tasks.add(task);
        task.getLabels().add(this);
    }

    /**
     * Supprime une tâche de ce label
     */
    public void removeTask(Task task) {
        this.tasks.remove(task);
        task.getLabels().remove(this);
    }

}