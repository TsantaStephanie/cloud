package com.roaddamage.controller;

import com.roaddamage.service.FirebaseService;
import com.roaddamage.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visitor")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VisitorController {
    
    @Autowired
    private FirebaseService firebaseService;
    
    @Autowired
    private CloudinaryService cloudinaryService;
    
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getAllReports() {
        try {
            List<Map<String, Object>> reports = firebaseService.getAllReports();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reports);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération des signalements");
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/reports")
    public ResponseEntity<Map<String, Object>> createReport(
            @RequestParam("description") String description,
            @RequestParam("gravite") String gravite,
            @RequestParam("statut") String statut,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            // Upload l'image si fournie
            String imageUrl = null;
            if (image != null && !image.isEmpty()) {
                imageUrl = cloudinaryService.uploadImage(image);
            }
            
            // Créer le signalement
            Map<String, Object> report = new HashMap<>();
            report.put("description", description);
            report.put("gravite", gravite);
            report.put("statut", statut);
            report.put("latitude", latitude);
            report.put("longitude", longitude);
            report.put("imageUrl", imageUrl);
            report.put("date_creation", new java.util.Date().toString());
            
            // Sauvegarder dans Firebase
            String reportId = firebaseService.createReport(report);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Signalement créé avec succès");
            response.put("reportId", reportId);
            response.put("imageUrl", imageUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la création du signalement: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/reports/stats")
    public ResponseEntity<Map<String, Object>> getReportsStats() {
        try {
            Map<String, Object> stats = firebaseService.getReportsStats();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération des statistiques");
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
