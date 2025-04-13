package com.example.taskpro.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test/public")
    public String publicRoute() {
        return "Public Route OK";
    }

    @GetMapping("/api/test/private")
    public String privateRoute() {
        return "Private Route (Auth required)";
    }
}
