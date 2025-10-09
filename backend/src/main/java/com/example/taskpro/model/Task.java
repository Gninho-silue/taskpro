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
@Table(name = "tasks")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Task extends BaseEntity {
    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    private TaskPriority priority = TaskPriority.MEDIUM;

    private LocalDateTime dueDate;
    private Integer estimatedHours;
    private Integer actualHours;
    private LocalDateTime completedAt;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @JsonIgnore
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TaskAttachment> attachments = new HashSet<>();

    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "task_labels",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "label_id")
    )
    private Set<Label> labels = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "parent_task_id")
    private Task parentTask;

    @JsonIgnore
    @OneToMany(mappedBy = "parentTask")
    private Set<Task> subtasks = new HashSet<>();

    public void assignToUser(User user) {
        this.assignee = user;
        if (user != null) {
            user.getAssignedTasks().add(this);
        }
    }

    public void unassignUser() {
        if (this.assignee != null) {
            User oldAssignee = this.assignee;
            this.assignee = null;
            oldAssignee.getAssignedTasks().remove(this);
        }
    }

    public void setCreator(User creator) {
        this.creator = creator;
        if (creator != null) {
            creator.getCreatedTasks().add(this);
        }
    }

    /**
     * Ajoute un label à cette tâche
     */
    public void addLabel(Label label) {
        this.labels.add(label);
        label.getTasks().add(this);
    }

    /**
     * Supprime un label de cette tâche
     */
    public void removeLabel(Label label) {
        this.labels.remove(label);
        label.getTasks().remove(this);
    }

    public void setParentTask(Task parent) {
        this.parentTask = parent;
        if (parent != null) {
            parent.getSubtasks().add(this);
        }
    }

    public void removeParentTask() {
        if (this.parentTask != null) {
            Task oldParent = this.parentTask;
            this.parentTask = null;
            oldParent.getSubtasks().remove(this);
        }
    }



}


