package com.roaddamage.service;

import com.roaddamage.config.CloudinaryConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private CloudinaryConfig cloudinaryConfig;

    public String uploadImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Fichier vide");
        }

        // Créer une requête multipart pour Cloudinary
        Map<String, Object> params = new HashMap<>();
        params.put("file", file.getBytes());
        params.put("upload_preset", cloudinaryConfig.getUploadPreset());

        // Utiliser une requête HTTP simple pour l'upload
        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
        
        java.net.http.HttpRequest.Builder requestBuilder = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(cloudinaryConfig.getUploadUrl()))
                .header("Content-Type", "multipart/form-data");

        // Construire le corps de la requête multipart
        String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
        StringBuilder body = new StringBuilder();
        
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"")
            .append(file.getOriginalFilename()).append("\"\r\n");
        body.append("Content-Type: ").append(file.getContentType()).append("\r\n\r\n");
        body.append(new String(file.getBytes())).append("\r\n");
        
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"upload_preset\"\r\n\r\n");
        body.append(cloudinaryConfig.getUploadPreset()).append("\r\n");
        body.append("--").append(boundary).append("--\r\n");

        requestBuilder.POST(java.net.http.HttpRequest.BodyPublishers.ofString(body.toString()));
        requestBuilder.header("Content-Type", "multipart/form-data; boundary=" + boundary);

        try {
            java.net.http.HttpResponse<String> response = client.send(
                    requestBuilder.build(),
                    java.net.http.HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() == 200) {
                // Parser la réponse JSON pour extraire l'URL
                String responseBody = response.body();
                // Simple parsing pour extraire secure_url
                int urlIndex = responseBody.indexOf("\"secure_url\":\"");
                if (urlIndex != -1) {
                    int start = urlIndex + 13;
                    int end = responseBody.indexOf("\"", start);
                    return responseBody.substring(start, end);
                }
            }
            
            throw new RuntimeException("Échec de l'upload: " + response.body());
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'upload Cloudinary", e);
        }
    }

    public String getOptimizedUrl(String publicId, int width, int height) {
        return cloudinaryConfig.getResizedUrl(publicId, width, height);
    }
}
