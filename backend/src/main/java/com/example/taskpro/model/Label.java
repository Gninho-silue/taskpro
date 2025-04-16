package com.example.taskpro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;


@Data
@Entity
@SuperBuilder
@Table(name = "labels")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Label extends BaseEntity {


    @NotBlank
    @Size(min = 2, max = 50)
    @Column(nullable = false)
    private String name;


    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToMany(mappedBy = "labels")
    private Set<Task> tasks = new HashSet<>();
}

