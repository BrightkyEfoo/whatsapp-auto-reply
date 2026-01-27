# 🚀 Guide de démarrage rapide

## En 5 minutes ⏱️

### 1. Installation

```bash
npm install
```

### 2. Configuration

Créer le fichier `.env` :

```bash
cp .env.example .env
```

Éditer `.env` et remplir :

```env
OPENAI_API_KEY=sk-votre-cle-openai-ici
GIRLFRIEND_NUMBER=2376XXXXXXXX@c.us
PORT=3000
MAX_MESSAGES=3
RESPONSE_DELAY_MIN=3
RESPONSE_DELAY_MAX=8
```

**Note** : Pour le `GIRLFRIEND_NUMBER`, démarre d'abord le bot, envoie un message, et regarde les logs pour voir le format exact.

**Messages matinaux** : Par défaut, le bot envoie 2-6 messages chaque matin entre 8h et 10h. Tu peux personnaliser dans `.env` :

```env
MORNING_START_HOUR=8
MORNING_END_HOUR=10
MORNING_MIN_MESSAGES=2
MORNING_MAX_MESSAGES=6
USE_AI_MORNING=false
```

### 3. Lancement

```bash
npm start
```

### 4. Scanner le QR Code

1. Ouvre ton navigateur sur `http://localhost:3000`
2. Clique sur **"Démarrer le bot"**
3. Scanne le QR code avec WhatsApp
4. ✅ Prêt !

---

## Déploiement serveur 🌐

### Option simple : PM2

```bash
# Installer PM2
npm install -g pm2

# Lancer le bot
pm2 start ecosystem.config.cjs

# Sauvegarder
pm2 save
pm2 startup
```

### Commandes PM2 utiles

```bash
pm2 status              # Voir l'état
pm2 logs whatsapp-bot   # Voir les logs
pm2 restart whatsapp-bot # Redémarrer
pm2 stop whatsapp-bot    # Arrêter
```

---

## ⚠️ Points importants

1. **Ne commit jamais le fichier `.env`** (il contient ta clé API)
2. **Obtenir le bon format de numéro** : lance le bot une fois et regarde les logs
3. **Usage modéré** : ne spam pas, risque de ban WhatsApp
4. **Clé OpenAI** : assure-toi d'avoir des crédits

---

## 🆘 Problème ?

**Le QR code n'apparaît pas** → Vérifie les logs avec `pm2 logs`

**Le bot ne répond pas** → Vérifie que :
- Le bouton "Réponses Auto" est vert (activé)
- Le numéro dans `.env` est correct
- Ta clé OpenAI fonctionne

**Erreur "Session closed"** → Rescanne le QR code

---

## 📱 Interface web

L'interface te permet de :
- ✅ Scanner le QR code
- ✅ Activer/désactiver les réponses automatiques
- ✅ Activer/désactiver les messages matinaux
- ✅ Tester les messages matinaux immédiatement
- ✅ Voir l'historique des messages
- ✅ Contrôler le bot en temps réel

**🌅 Messages matinaux** : Chaque jour entre 8h-10h, le bot envoie automatiquement 2-6 messages affectueux ("bonjour b", "bien dormi ?", "bonne journée", etc.) avec des délais naturels de 2-8 minutes entre chaque message.

---

**Besoin d'aide ?** Consulte le [README complet](README.md)
