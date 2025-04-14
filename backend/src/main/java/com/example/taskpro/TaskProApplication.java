package com.example.taskpro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
@EnableAsync
@SpringBootApplication
public class TaskProApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskProApplication.class, args);
	}

}
