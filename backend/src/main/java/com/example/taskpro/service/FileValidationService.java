package com.example.taskpro.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class FileValidationService {

    // Types MIME autorisés
    private static final Set<String> ALLOWED_FILE_TYPES = new HashSet<>(Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/svg+xml"
    ));
    
    // Taille maximale de fichier en octets (10 Mo)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    public boolean isValidFileType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && ALLOWED_FILE_TYPES.contains(contentType);
    }
    
    public boolean isValidFileSize(MultipartFile file) {
        return file.getSize() <= MAX_FILE_SIZE;
    }
    
    /**
     * Valide un fichier et retourne une chaîne d'erreur si le fichier est invalide
     * @return null si le fichier est valide, sinon un message d'erreur
     */
    public String validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            return "File cannot be empty";
        }
        
        if (!isValidFileType(file)) {
            return "File type not allowed. Allowed types: PDF, Word, Excel, PowerPoint, text, and images";
        }
        
        if (!isValidFileSize(file)) {
            return "File size exceeds the maximum limit of 10MB";
        }
        
        return null; // Le fichier est valide
    }
}