package com.roaddamage.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Bean
    public Firestore firestore() throws IOException {
        try {
            // Utiliser les credentials depuis le fichier serviceAccountKey.json
            InputStream serviceAccount = getClass().getResourceAsStream("/serviceAccountKey.json");
            
            if (serviceAccount == null) {
                throw new IllegalStateException("Fichier serviceAccountKey.json non trouvé dans src/main/resources");
            }

            GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
            
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .setProjectId("cloud-project-389d0")
                    .build();

            FirebaseApp.initializeApp(options);
            
            return FirestoreClient.getFirestore();
            
        } catch (IOException e) {
            throw new RuntimeException("Erreur d'initialisation Firebase", e);
        }
    }

    @Bean
    public Storage storage() throws IOException {
        try {
            InputStream serviceAccount = getClass().getResourceAsStream("/serviceAccountKey.json");
            
            if (serviceAccount == null) {
                throw new IllegalStateException("Fichier serviceAccountKey.json non trouvé dans src/main/resources");
            }

            GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
            
            StorageOptions storageOptions = StorageOptions.newBuilder()
                    .setCredentials(credentials)
                    .setProjectId("cloud-project-389d0")
                    .build();

            return storageOptions.getService();
            
        } catch (IOException e) {
            throw new RuntimeException("Erreur d'initialisation Storage", e);
        }
    }
}
