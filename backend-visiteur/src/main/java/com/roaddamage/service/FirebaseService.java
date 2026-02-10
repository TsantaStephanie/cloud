package com.roaddamage.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class FirebaseService {
    
    private Firestore firestore;
    
    @PostConstruct
    public void initialize() {
        try {
            // Pour l'instant, on initialise sans identifiants pour tester
            FirebaseOptions options = FirebaseOptions.builder()
                .setProjectId("cloud-project-389d0")
                .build();
            
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
            
            this.firestore = FirestoreClient.getFirestore();
            System.out.println("✅ Firebase initialisé avec succès !");
            
        } catch (Exception e) {
            System.err.println("❌ Erreur initialisation Firebase: " + e.getMessage());
            // On continue même si Firebase ne marche pas
            System.out.println("⚠️ Backend démarré sans Firebase - mode test");
        }
    }
    
    // Récupérer tous les signalements
    public List<Map<String, Object>> getAllReports() {
        List<Map<String, Object>> reports = new ArrayList<>();
        
        try {
            // Si Firebase n'est pas initialisé, retourne des données de test
            if (firestore == null) {
                return getTestData();
            }
            
            List<QueryDocumentSnapshot> documents = firestore.collection("reports")
                .get()
                .get()
                .getDocuments();
            
            for (QueryDocumentSnapshot doc : documents) {
                Map<String, Object> report = doc.getData();
                report.put("id", doc.getId());
                reports.add(report);
            }
            
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("❌ Erreur récupération signalements: " + e.getMessage());
            // En cas d'erreur, retourne les données de test
            return getTestData();
        }
        
        return reports;
    }
    
    // Données de test pour le mode développement
    private List<Map<String, Object>> getTestData() {
        List<Map<String, Object>> reports = new ArrayList<>();
        
        Map<String, Object> report1 = new HashMap<>();
        report1.put("id", "1");
        report1.put("latitude", -18.8792);
        report1.put("longitude", 47.5079);
        report1.put("gravite", "critique");
        report1.put("description", "Grand nid-de-poule avenue de l'Indépendance");
        report1.put("statut", "signale");
        report1.put("date_creation", "2024-01-15T10:30:00Z");
        reports.add(report1);
        
        Map<String, Object> report2 = new HashMap<>();
        report2.put("id", "2");
        report2.put("latitude", -18.9123);
        report2.put("longitude", 47.5234);
        report2.put("gravite", "moyenne");
        report2.put("description", "Route dégradée près du marché");
        report2.put("statut", "verifie");
        report2.put("date_creation", "2024-01-14T14:20:00Z");
        reports.add(report2);
        
        return reports;
    }
    
    // Récupérer les statistiques
    public Map<String, Object> getReportsStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            long total = firestore.collection("reports").get().get().size();
            stats.put("total", total);
            
            // TODO: Ajouter plus de statistiques par gravité/statut
            
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("❌ Erreur récupération statistiques: " + e.getMessage());
        }
        
        return stats;
    }
}
