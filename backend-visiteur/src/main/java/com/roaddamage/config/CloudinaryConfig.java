package com.roaddamage.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud.name}")
    private String cloudName;

    @Value("${cloudinary.upload.preset}")
    private String uploadPreset;

    @Value("${cloudinary.api.url}")
    private String apiUrl;

    public String getCloudName() {
        return cloudName;
    }

    public String getUploadPreset() {
        return uploadPreset;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public String getUploadUrl() {
        return String.format("https://api.cloudinary.com/v1_1/%s/image/upload", cloudName);
    }

    public String getResizedUrl(String publicId, int width, int height) {
        return String.format("https://res.cloudinary.com/%s/image/upload/w_%d,h_%d/%s", 
                          cloudName, width, height, publicId);
    }
}
