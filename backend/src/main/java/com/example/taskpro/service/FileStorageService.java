package com.example.taskpro.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
@Slf4j
@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${application.file.upload.files-output-path}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            log.error("Could not create folder the target folder");
            throw new RuntimeException("Error creating the directory where the uploaded files will be stored." +
                    " Error: " + ex.getMessage());
        }
    }

    public String storeFile(MultipartFile file) throws IOException {
        // Normaliser le nom du fichier
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        
        // Vérifier si le nom du fichier contient des caractères invalides
        if (originalFileName.contains("..")) {
            log.warn("filename contains invalid relative path component: {}", originalFileName);
            throw new RuntimeException(">" + originalFileName + "< contains invalid relative path component");
        }
        
        // Générer un nom unique pour éviter les collisions
        String fileExtension = "";
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = System.currentTimeMillis() + fileExtension;
        
        // Copier le fichier dans le dossier de destination
        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    public byte[] loadFile(String fileName) throws IOException {
        Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
        return Files.readAllBytes(filePath);
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.error("Error while deleting file {}: {}", fileName, ex.getMessage());
            throw new RuntimeException("Error while deleting file " + fileName, ex);
        }
    }
}