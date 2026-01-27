# 🤖 WhatsApp Auto-Reply Bot

Bot de réponses automatiques WhatsApp avec interface web pour la gestion et le scanning du QR code.

## ✨ Fonctionnalités

- ✅ **Interface web** pour scanner le QR code WhatsApp
- ✅ **Réponses automatiques** générées par OpenAI
- ✅ **Messages matinaux automatiques** : 2-6 messages entre 8h-10h chaque jour
- ✅ **Limitation intelligente** : 2-3 messages puis "je vais dormir"
- ✅ **Délai naturel** : attente aléatoire entre les réponses (3-8s)
- ✅ **Tableau de bord** en temps réel
- ✅ **Historique** des messages
- ✅ **Contrôle total** : activation/désactivation, reset, etc.

## 📋 Prérequis

- Node.js v18+
- Un compte OpenAI avec une clé API
- Un serveur (VPS, Cloud, etc.) pour le déploiement

## 🚀 Installation

### 1. Cloner ou télécharger le projet

```bash
git clone <votre-repo>
cd whatsapp-auto-reply
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Créer un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditer le fichier `.env` :

```env
# OpenAI API Key
OPENAI_API_KEY=sk-votre-cle-api-openai

# Numéro WhatsApp de ta copine (format: 2376XXXXXXXX@c.us)
GIRLFRIEND_NUMBER=2376XXXXXXXX@c.us

# Port du serveur
PORT=3000

# Nombre maximum de messages avant "je vais dormir"
MAX_MESSAGES=3

# Délai de réponse en secondes (pour paraître naturel)
RESPONSE_DELAY_MIN=3
RESPONSE_DELAY_MAX=8
```

**Important** : Pour obtenir le numéro WhatsApp au bon format :
1. Démarre le bot une première fois
2. Envoie un message depuis le compte de ta copine
3. Regarde dans les logs, tu verras le format complet du numéro

### 4. Lancer le bot localement (test)

```bash
npm start
```

Ouvre ton navigateur sur `http://localhost:3000`

## 🌐 Déploiement sur serveur

### Option 1 : VPS (Ubuntu/Debian)

#### 1. Connexion SSH

```bash
ssh user@votre-serveur.com
```

#### 2. Installation de Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. Installation du projet

```bash
cd /var/www
git clone <votre-repo> whatsapp-bot
cd whatsapp-bot
npm install
```

#### 4. Configuration

```bash
nano .env
# Remplir les valeurs comme expliqué ci-dessus
```

#### 5. Installer PM2 (gestionnaire de processus)

```bash
sudo npm install -g pm2
```

#### 6. Lancer le bot avec PM2

```bash
pm2 start src/index.js --name whatsapp-bot
pm2 save
pm2 startup
```

#### 7. Configuration Nginx (optionnel mais recommandé)

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/whatsapp-bot
```

Contenu du fichier :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

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

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. SSL avec Let's Encrypt (optionnel)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

### Option 2 : Heroku

#### 1. Créer un fichier `Procfile`

```
web: node src/index.js
```

#### 2. Déployer

```bash
heroku login
heroku create votre-app-name
heroku config:set OPENAI_API_KEY=sk-votre-cle
heroku config:set GIRLFRIEND_NUMBER=2376XXXXXXXX@c.us
git push heroku main
```

### Option 3 : Railway / Render / DigitalOcean App Platform

Ces plateformes détectent automatiquement Node.js.

1. Connecte ton repo GitHub
2. Configure les variables d'environnement dans le dashboard
3. Déploie

## ⚙️ Configuration des messages matinaux

Dans ton fichier `.env`, tu peux personnaliser les messages matinaux :

```env
# Plage horaire (8h à 10h par défaut)
MORNING_START_HOUR=8
MORNING_END_HOUR=10

# Nombre de messages (2 à 6 par défaut)
MORNING_MIN_MESSAGES=2
MORNING_MAX_MESSAGES=6

# Utiliser l'IA pour varier les messages (false par défaut)
USE_AI_MORNING=false
```

**Mode IA vs Messages prédéfinis** :
- `USE_AI_MORNING=false` : Utilise une liste de 19 messages prédéfinis variés
- `USE_AI_MORNING=true` : OpenAI génère des messages uniques à chaque fois (coûte quelques centimes)

**Messages prédéfinis inclus** :
- "Bonjour b ❤️"
- "Bien dormi ? 😊"
- "Bonne journée à l'école ✨"
- "Je pense à toi 💭"
- Et 15 autres messages affectueux

## 🎮 Utilisation

### 1. Accéder à l'interface

Ouvre ton navigateur sur `http://votre-serveur:3000`

### 2. Scanner le QR Code

1. Clique sur **"Démarrer le bot"**
2. Un QR code apparaît
3. Ouvre WhatsApp → Plus d'options → Appareils connectés
4. Scanne le QR code

### 3. Contrôles disponibles

- **▶️ Démarrer le bot** : Lance la connexion WhatsApp
- **⏹️ Arrêter le bot** : Arrête complètement le bot
- **🔄 Activer/Désactiver réponses** : Active ou désactive les réponses auto (sans déconnecter)
- **🔄 Reset conversations** : Réinitialise le compteur de messages
- **🌅 Activer/Désactiver messages matinaux** : Active ou désactive l'envoi automatique matinal
- **🧪 Tester messages matinaux** : Envoie immédiatement 2-6 messages de test

### 4. Messages matinaux automatiques

Le bot peut envoyer **automatiquement** des messages chaque matin entre 8h et 10h :

- **Nombre aléatoire** : entre 2 et 6 messages
- **Délais naturels** : 2-8 minutes entre chaque message
- **Messages variés** : "bonjour b", "bien dormi ?", "bonne journée", etc.
- **Mode IA** : active `USE_AI_MORNING=true` pour générer des messages uniques avec OpenAI
- **Contrôles** : active/désactive via l'interface ou teste immédiatement

Parfait pour envoyer des messages affectueux pendant qu'elle est à l'école sans avoir à y penser.

### 5. Monitoring

Le tableau de bord affiche en temps réel :
- État de la connexion
- État du bot
- État des réponses automatiques
- État des messages matinaux
- Nombre de messages envoyés
- Historique des conversations

## 🔒 Sécurité & Bonnes Pratiques

### ⚠️ Risques WhatsApp

- WhatsApp n'autorise pas officiellement les bots
- **Risque de bannissement faible** si usage personnel et modéré
- **NE PAS** utiliser pour du spam ou business

### ✅ Pour minimiser les risques

1. **Limiter à 1 contact** (déjà configuré)
2. **Peu de messages par jour** (déjà limité à 2-3 messages)
3. **Délai naturel** entre réponses (déjà configuré)
4. **Ne pas répondre 24/7** : désactive le bot quand tu ne l'utilises pas

### 🛡️ Sécurité serveur

1. **Firewall** : N'ouvre que le port 80 (HTTP) et 443 (HTTPS)
2. **Variables d'environnement** : Ne commit JAMAIS le fichier `.env`
3. **HTTPS** : Utilise toujours SSL en production
4. **Authentification** : Ajoute une auth si tu exposes publiquement

## 📁 Structure du projet

```
whatsapp-auto-reply/
├── src/
│   ├── index.js         # Serveur Express + Socket.IO
│   ├── whatsapp.js      # Logique WhatsApp
│   ├── ai.js            # Intégration OpenAI
│   └── state.js         # Gestion de l'état
├── public/
│   └── index.html       # Interface web
├── .env.example         # Template de configuration
├── package.json
└── README.md
```

## 🛠️ Commandes utiles

### Démarrer en développement

```bash
npm run dev
```

### Voir les logs (PM2)

```bash
pm2 logs whatsapp-bot
```

### Redémarrer le bot (PM2)

```bash
pm2 restart whatsapp-bot
```

### Arrêter le bot (PM2)

```bash
pm2 stop whatsapp-bot
```

### Supprimer le bot de PM2

```bash
pm2 delete whatsapp-bot
```

## 🐛 Dépannage

### Le QR code n'apparaît pas

1. Vérifie que le port 3000 est bien ouvert
2. Vérifie les logs : `pm2 logs whatsapp-bot`
3. Redémarre le serveur

### "Session fermée"

WhatsApp a fermé la session. Recommence le scan du QR code.

### Le bot ne répond pas

1. Vérifie que les réponses auto sont **activées** (bouton vert)
2. Vérifie le numéro dans `.env` (bon format)
3. Vérifie que la clé OpenAI est valide

### Erreur OpenAI

1. Vérifie ta clé API
2. Vérifie que tu as des crédits OpenAI
3. Vérifie ta connexion internet

### Les messages matinaux ne s'envoient pas

1. Vérifie que les messages matinaux sont **activés** (bouton vert)
2. Vérifie l'heure actuelle (doit être entre MORNING_START_HOUR et MORNING_END_HOUR)
3. Les messages ne s'envoient qu'**une fois par jour**
4. Utilise le bouton "Tester messages matinaux" pour un envoi immédiat

### Je veux renvoyer les messages matinaux aujourd'hui

1. Utilise le bouton **"🧪 Tester messages matinaux"** dans l'interface
2. Ou via API : `POST /api/morning/test`

## 🔄 Mises à jour

```bash
cd /var/www/whatsapp-bot
git pull
npm install
pm2 restart whatsapp-bot
```

## 📝 Notes importantes

- **Ne partage JAMAIS** ton fichier `.env` ou ta clé OpenAI
- **Sauvegarde** régulièrement ton dossier `.wwebjs_auth` (contient la session WhatsApp)
- **Teste d'abord** en local avant de déployer en production

## 💡 Améliorations possibles

- [ ] Ajouter une authentification à l'interface web
- [ ] Historique persistant (base de données)
- [ ] Planification des horaires d'activité
- [ ] Réponses différentes selon l'heure
- [ ] Mode "apprentissage" pour analyser le ton de conversation

## 📧 Support

Si tu as des questions ou problèmes, crée une issue sur le repo.

---

**⚠️ Disclaimer** : Ce projet est à usage éducatif et personnel. L'auteur n'est pas responsable de l'usage que tu en fais. Utilise de manière responsable et éthique.
