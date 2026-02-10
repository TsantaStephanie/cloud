# Backend Visiteur - Road Damage Reporter

Backend Spring Boot pour l'application web visiteur de signalement de routes endommagées.

## 🚀 Démarrage

```bash
# Compiler le projet
mvn clean compile

# Lancer le serveur
mvn spring-boot:run

# Ou compiler et lancer en une commande
mvn clean install && mvn spring-boot:run
```

Le serveur démarre sur `http://localhost:8080`

## 📡️ API Endpoints

### **GET** - Récupération des données

#### **`GET /api/visitor/reports`**
Récupère tous les signalements depuis Firebase Firestore.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "description": "Route endommagée...",
      "gravite": "critique",
      "statut": "signale",
      "latitude": -18.8792,
      "longitude": 47.5079,
      "imageUrl": "https://res.cloudinary.com/...",
      "date_creation": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### **`GET /api/visitor/reports/stats`**
Récupère les statistiques des signalements.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "total": 42
  }
}
```

### **POST** - Création de données

#### **`POST /api/visitor/reports`**
Crée un nouveau signalement avec upload d'image optionnel.

**Paramètres :**
- `description` (String) - Description du signalement
- `gravite` (String) - Niveau de gravité (faible|moyenne|critique)
- `statut` (String) - Statut du signalement (signale|verifie|traite)
- `latitude` (Double) - Latitude GPS
- `longitude` (Double) - Longitude GPS  
- `image` (MultipartFile, optionnel) - Photo du signalement

**Réponse :**
```json
{
  "success": true,
  "message": "Signalement créé avec succès",
  "reportId": "abc123",
  "imageUrl": "https://res.cloudinary.com/ddmnsomc5/image/upload/..."
}
```

## 🔧 Configuration

### **Firebase**
- Projet : `cloud-project-389d0`
- Collection : `reports`
- Credentials : `src/main/resources/firebase-credentials.json`

### **Cloudinary**
- Cloud Name : `ddmnsomc5`
- Upload Preset : `signalements_upload`
- Support images : JPEG, PNG, WebP

### **CORS**
Origines autorisées :
- `http://localhost:3000` (React dev)
- `http://localhost:5173` (Vite dev)
- `http://localhost:8100` (Ionic dev)

## 🛠️ Technologies

- **Java 17** - Langage principal
- **Spring Boot 3.2.0** - Framework web
- **Firebase Admin SDK 9.4.1** - Base de données
- **Google Cloud Storage 2.27.0** - Stockage images
- **Maven** - Gestion des dépendances

## 📱 Utilisation

### **Depuis le mobile (Vue 3 + Ionic)**
```javascript
// Créer un signalement
const formData = new FormData();
formData.append('description', 'Route endommagée...');
formData.append('gravite', 'critique');
formData.append('latitude', '-18.8792');
formData.append('longitude', '47.5079');
formData.append('image', imageFile);

const response = await fetch('http://localhost:8080/api/visitor/reports', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Signalement ID:', result.reportId);
```

### **Depuis le frontend (React)**
```javascript
// Récupérer tous les signalements
const response = await fetch('http://localhost:8080/api/visitor/reports');
const data = await response.json();

setReports(data.data);
```

## 🔍 Tests

### **Test avec Postman/curl**
```bash
# Créer un signalement
curl -X POST http://localhost:8080/api/visitor/reports \
  -F "description=Test route" \
  -F "gravite=moyenne" \
  -F "statut=signale" \
  -F "latitude=-18.8792" \
  -F "longitude=47.5079" \
  -F "image=@/path/to/image.jpg"

# Récupérer les signalements
curl http://localhost:8080/api/visitor/reports
```

## 🚨 Dépannage

### **Problèmes courants**

#### **Firebase non initialisé**
```
⚠️ Mode test - simulation de création
```
**Solution :** Vérifiez que `firebase-credentials.json` est dans `src/main/resources/`

#### **Upload Cloudinary échoue**
```
❌ Erreur lors de l'upload Cloudinary
```
**Solution :** Vérifiez la configuration Cloudinary dans `application.properties`

#### **CORS bloqué**
```
Access to fetch at 'http://localhost:8080' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution :** Vérifiez les origines autorisées dans `application.properties`

## 📝 Logs

Le backend génère des logs détaillés :
- ✅ Succès : Opérations réussies
- ❌ Erreurs : Problèmes rencontrés
- ⚠️ Avertissements : Mode test, fallbacks

## 🔐 Sécurité

- **JWT** : Pour l'authentification future (non implémenté)
- **HTTPS** : Recommandé pour la production
- **Validation** : Les entrées sont validées côté serveur
