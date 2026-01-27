# 🚀 Guide de Déploiement Docker

## 📋 Prérequis

- Un serveur Linux (Ubuntu 20.04+ recommandé)
- Accès SSH au serveur
- Clé SSH configurée (sans mot de passe)

## ⚡ Déploiement en 1 Commande

```bash
./deploy.sh [IP_SERVEUR] [UTILISATEUR]
```

### Exemple

```bash
./deploy.sh 192.168.1.100 root
```

ou

```bash
./deploy.sh mon-serveur.com ubuntu
```

## 🔧 Ce que fait le script

Le script `deploy.sh` automatise tout le processus :

1. ✅ Vérifie que le fichier `.env` existe
2. ✅ Teste la connexion SSH
3. ✅ Installe Docker et Docker Compose sur le serveur
4. ✅ Crée le répertoire `/opt/whatsapp-bot`
5. ✅ Upload les fichiers du projet
6. ✅ Build l'image Docker
7. ✅ Lance les conteneurs
8. ✅ Affiche le statut

## 📝 Configuration Avant Déploiement

### 1. Créer le fichier `.env`

```bash
cp .env.example .env
nano .env
```

Remplis toutes les variables :

```env
OPENAI_API_KEY=sk-votre-cle-api-openai
GIRLFRIEND_NUMBER=2376XXXXXXXX@c.us
PORT=3000
MAX_MESSAGES=3
RESPONSE_DELAY_MIN=3
RESPONSE_DELAY_MAX=8

# Messages matinaux
MORNING_START_HOUR=8
MORNING_END_HOUR=10
MORNING_MIN_MESSAGES=2
MORNING_MAX_MESSAGES=6
USE_AI_MORNING=false
```

### 2. Configurer l'accès SSH

Si tu n'as pas encore configuré l'accès SSH :

```bash
# Générer une clé SSH (si tu n'en as pas)
ssh-keygen -t ed25519

# Copier la clé sur le serveur
ssh-copy-id root@ton-serveur-ip
```

### 3. Déployer

```bash
./deploy.sh 192.168.1.100 root
```

## 🎯 Après le Déploiement

### Accéder à l'interface

```
http://ton-serveur-ip:3000
```

### Scanner le QR Code

1. Ouvre l'URL dans ton navigateur
2. Clique sur "Démarrer le bot"
3. Scanne le QR code avec WhatsApp

### Voir les logs

```bash
ssh root@ton-serveur-ip
cd /opt/whatsapp-bot
docker-compose logs -f
```

### Redémarrer le bot

```bash
ssh root@ton-serveur-ip
cd /opt/whatsapp-bot
docker-compose restart
```

### Arrêter le bot

```bash
ssh root@ton-serveur-ip
cd /opt/whatsapp-bot
docker-compose down
```

### Mettre à jour

Re-exécute simplement le script de déploiement :

```bash
./deploy.sh 192.168.1.100 root
```

## 🔧 Déploiement Manuel (sans script)

Si tu préfères déployer manuellement :

### 1. Sur ton serveur

```bash
# Installer Docker
curl -fsSL https://get.docker.com | sh

# Installer Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Créer le répertoire
mkdir -p /opt/whatsapp-bot
cd /opt/whatsapp-bot
```

### 2. Sur ta machine locale

```bash
# Créer l'archive
tar -czf whatsapp-bot.tar.gz \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    .

# Upload vers le serveur
scp whatsapp-bot.tar.gz root@ton-serveur-ip:/opt/whatsapp-bot/
```

### 3. Sur le serveur

```bash
cd /opt/whatsapp-bot

# Extraire
tar -xzf whatsapp-bot.tar.gz

# Créer le fichier .env
nano .env
# (copie ton .env local)

# Lancer
docker-compose up -d --build

# Voir les logs
docker-compose logs -f
```

## 🌐 Utiliser Nginx comme Reverse Proxy (Optionnel)

Pour utiliser un nom de domaine et HTTPS :

### 1. Installer Nginx

```bash
apt install nginx certbot python3-certbot-nginx
```

### 2. Créer la config Nginx

```bash
nano /etc/nginx/sites-available/whatsapp-bot
```

Contenu :

```nginx
server {
    listen 80;
    server_name whatsapp.ton-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3. Activer et SSL

```bash
# Activer le site
ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/

# Tester la config
nginx -t

# Recharger
systemctl reload nginx

# Obtenir SSL
certbot --nginx -d whatsapp.ton-domaine.com
```

Maintenant accessible sur `https://whatsapp.ton-domaine.com`

## 🐳 Commandes Docker Utiles

```bash
# Voir les conteneurs en cours
docker-compose ps

# Voir les logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Rebuild et redémarrer
docker-compose up -d --build

# Voir l'utilisation des ressources
docker stats

# Nettoyer les images inutilisées
docker image prune -a
```

## 📊 Volumes Docker

Les données persistantes sont stockées dans des volumes Docker :

- `whatsapp-session` : Session WhatsApp (pour ne pas rescanner le QR code)
- `whatsapp-logs` : Logs de l'application

Pour sauvegarder :

```bash
docker run --rm -v whatsapp-session:/data -v $(pwd):/backup alpine tar czf /backup/whatsapp-session-backup.tar.gz /data
```

Pour restaurer :

```bash
docker run --rm -v whatsapp-session:/data -v $(pwd):/backup alpine tar xzf /backup/whatsapp-session-backup.tar.gz -C /
```

## 🔒 Sécurité

### Firewall

```bash
# Installer ufw
apt install ufw

# Autoriser SSH
ufw allow ssh

# Autoriser le port 3000 (ou seulement en local si tu utilises Nginx)
ufw allow 3000/tcp

# Activer
ufw enable
```

### Variables d'environnement

Ne commit **JAMAIS** ton fichier `.env` ! Il contient ta clé OpenAI.

## 🆘 Dépannage

### Le conteneur ne démarre pas

```bash
docker-compose logs
```

### Problème de permissions

```bash
chmod 777 /opt/whatsapp-bot/.wwebjs_auth
chmod 777 /opt/whatsapp-bot/logs
```

### Session WhatsApp perdue

Rescanne simplement le QR code via l'interface web.

### Port déjà utilisé

Change le port dans `.env` :

```env
PORT=3001
```

Puis redéploie.

## 📈 Monitoring (Optionnel)

### Installer Portainer

```bash
docker volume create portainer_data
docker run -d -p 9000:9000 --name portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

Accède à `http://ton-serveur-ip:9000` pour gérer tes conteneurs visuellement.

## ✅ Checklist de Déploiement

- [ ] Fichier `.env` créé et rempli
- [ ] Accès SSH configuré
- [ ] Script de déploiement exécuté
- [ ] Interface web accessible
- [ ] QR code scanné
- [ ] Test d'envoi de message
- [ ] Messages matinaux configurés
- [ ] Logs vérifiés

---

**Questions ?** Consulte le [README principal](README.md) ou le [guide des messages matinaux](MESSAGES_MATINAUX.md).
