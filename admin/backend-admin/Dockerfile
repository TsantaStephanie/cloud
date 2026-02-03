FROM node:20
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev

# Copier le code source
COPY . .

# Créer le dossier .env s'il n'existe pas
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Exposer le port
EXPOSE 3001

# Démarrer l'application
CMD ["npm", "start"]
