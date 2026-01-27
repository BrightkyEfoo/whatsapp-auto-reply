# 🎯 Commandes Utiles

Guide rapide de toutes les commandes pour gérer le bot.

## 🛠️ Développement Local

### Installation et Setup

```bash
# Cloner le projet
git clone <votre-repo>
cd whatsapp-auto-reply

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
nano .env
```

### Développement

```bash
# Mode dev avec hot reload
npm run dev

# Build TypeScript
npm run build

# Vérifier les types
npm run typecheck

# Nettoyer
npm run clean
```

### Production locale

```bash
# Build et start
npm run build
npm start
```

## 🐳 Docker Local

### Basic

```bash
# Build l'image
docker-compose build

# Lancer
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart

# Rebuild tout
docker-compose up -d --build
```

### Debugging

```bash
# Entrer dans le conteneur
docker-compose exec whatsapp-bot sh

# Voir les processus
docker-compose top

# Voir les stats
docker stats

# Voir les volumes
docker volume ls

# Inspecter un volume
docker volume inspect whatsapp-auto-reply_whatsapp-session
```

### Nettoyage

```bash
# Supprimer les conteneurs
docker-compose down

# Supprimer les conteneurs + volumes
docker-compose down -v

# Nettoyer les images inutilisées
docker image prune -f

# Nettoyer tout
docker system prune -a
```

## 🚀 Déploiement

### Déploiement Automatique

```bash
# Déployer sur le serveur
./deploy.sh 192.168.1.100 root

# ou avec un autre utilisateur
./deploy.sh mon-serveur.com ubuntu
```

### Déploiement Manuel

```bash
# Sur ta machine
tar -czf whatsapp-bot.tar.gz \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    .

scp whatsapp-bot.tar.gz root@serveur:/opt/whatsapp-bot/

# Sur le serveur
ssh root@serveur
cd /opt/whatsapp-bot
tar -xzf whatsapp-bot.tar.gz
docker-compose up -d --build
```

## 📡 Commandes Serveur

### SSH

```bash
# Se connecter
ssh root@ton-serveur-ip

# Copier un fichier
scp fichier.txt root@serveur:/opt/whatsapp-bot/

# Exécuter une commande
ssh root@serveur 'cd /opt/whatsapp-bot && docker-compose ps'
```

### Gestion du Bot sur le Serveur

```bash
# Se connecter au serveur
ssh root@ton-serveur-ip

# Aller dans le répertoire
cd /opt/whatsapp-bot

# Voir le statut
docker-compose ps

# Voir les logs
docker-compose logs -f

# Logs des 100 dernières lignes
docker-compose logs --tail=100

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Démarrer
docker-compose up -d

# Rebuild et restart
docker-compose up -d --build

# Voir les ressources utilisées
docker stats
```

### Backup de la Session WhatsApp

```bash
# Backup
docker run --rm \
  -v whatsapp-auto-reply_whatsapp-session:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/session-backup.tar.gz /data

# Restaurer
docker run --rm \
  -v whatsapp-auto-reply_whatsapp-session:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/session-backup.tar.gz -C /
```

## 🔧 Makefile

```bash
# Voir toutes les commandes
make help

# Installation
make install

# Dev
make dev

# Build
make build

# Docker
make docker-up
make docker-logs
make docker-down
make docker-rebuild

# Déployer
make deploy SERVER_IP=192.168.1.100

# Test config
make test-env
```

## 🌐 Nginx (si configuré)

```bash
# Éditer la config
sudo nano /etc/nginx/sites-available/whatsapp-bot

# Tester la config
sudo nginx -t

# Recharger
sudo systemctl reload nginx

# Redémarrer
sudo systemctl restart nginx

# Voir les logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Obtenir/renouveler SSL
sudo certbot --nginx -d whatsapp.ton-domaine.com
sudo certbot renew
```

## 🔥 Firewall

```bash
# Installer ufw
sudo apt install ufw

# Autoriser SSH
sudo ufw allow ssh

# Autoriser le port 3000
sudo ufw allow 3000/tcp

# Autoriser HTTP/HTTPS (si Nginx)
sudo ufw allow 'Nginx Full'

# Activer
sudo ufw enable

# Voir le statut
sudo ufw status
```

## 📊 Monitoring

```bash
# CPU/RAM usage
htop

# Espace disque
df -h

# Docker stats
docker stats

# Logs en temps réel
docker-compose logs -f --tail=50

# Processus
ps aux | grep node
```

## 🐛 Debug

```bash
# Logs complets
docker-compose logs --no-log-prefix

# Logs d'un service spécifique
docker-compose logs whatsapp-bot

# Logs avec timestamp
docker-compose logs -t

# Suivre les logs
docker-compose logs -f

# Entrer dans le conteneur
docker-compose exec whatsapp-bot sh

# Variables d'environnement
docker-compose exec whatsapp-bot env

# Tester la connexion API
docker-compose exec whatsapp-bot node -e "console.log(process.env.OPENAI_API_KEY)"
```

## 🔄 Mise à jour

```bash
# Sur ta machine locale
git pull
./deploy.sh ton-serveur-ip root

# Ou manuellement sur le serveur
cd /opt/whatsapp-bot
docker-compose pull
docker-compose up -d --build
```

## 🗑️ Désinstallation

```bash
# Sur le serveur
cd /opt/whatsapp-bot
docker-compose down -v
cd ..
rm -rf /opt/whatsapp-bot

# Supprimer Docker (optionnel)
sudo apt remove docker-ce docker-ce-cli containerd.io
```

## 📝 Exemples Complets

### Déployer la première fois

```bash
# 1. Créer .env localement
cp .env.example .env
nano .env

# 2. Déployer
./deploy.sh 192.168.1.100 root

# 3. Ouvrir dans le navigateur
open http://192.168.1.100:3000
```

### Mettre à jour après des changements

```bash
# 1. Commit les changements
git add .
git commit -m "Update"

# 2. Redéployer
./deploy.sh 192.168.1.100 root

# 3. Vérifier
ssh root@192.168.1.100 'cd /opt/whatsapp-bot && docker-compose logs --tail=50'
```

### Debug un problème

```bash
# 1. Voir les logs
ssh root@serveur 'cd /opt/whatsapp-bot && docker-compose logs -f'

# 2. Entrer dans le conteneur
ssh root@serveur
cd /opt/whatsapp-bot
docker-compose exec whatsapp-bot sh

# 3. Vérifier la config
cat .env
env | grep OPENAI

# 4. Redémarrer
docker-compose restart
```

---

**Conseil Pro** : Ajoute ces alias dans ton `~/.bashrc` ou `~/.zshrc` :

```bash
alias wab='ssh root@ton-serveur-ip "cd /opt/whatsapp-bot && "'
alias wab-logs='wab docker-compose logs -f'
alias wab-restart='wab docker-compose restart'
alias wab-status='wab docker-compose ps'
```

Utilisation :

```bash
wab-logs
wab-restart
wab-status
```
