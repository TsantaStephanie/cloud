package com.roaddamage.controller;

import com.roaddamage.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visitor")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VisitorController {
    
    @Autowired
    private FirebaseService firebaseService;
    
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
