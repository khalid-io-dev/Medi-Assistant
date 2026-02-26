# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Installer un serveur statique léger
RUN npm install -g serve

# Copier les fichiers construits depuis le stage précédent
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["serve", "-s", "dist", "-l", "3000"]
