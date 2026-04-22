package com.sliit.healthcare.patient.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.file.storage.path:uploads/medical-reports}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        try {
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String saveFile(MultipartFile file) {
        Objects.requireNonNull(file, "File must not be null");

        try {
            String fileExtension = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                fileExtension = originalName.substring(originalName.lastIndexOf('.'));
            }

            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path targetLocation = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return uploadDir + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file: " + ex.getMessage(), ex);
        }
    }

    public boolean deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return false;
        }

        try {
            Path path = Paths.get(filePath).toAbsolutePath().normalize();
            return Files.deleteIfExists(path);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file: " + ex.getMessage(), ex);
        }
    }
}
