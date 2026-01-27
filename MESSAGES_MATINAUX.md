# 🌅 Messages Matinaux - Guide Complet

## 📖 Qu'est-ce que c'est ?

Les **messages matinaux** sont une fonctionnalité qui envoie automatiquement des messages affectueux à ta copine chaque matin pendant qu'elle est à l'école, sans que tu aies à y penser.

**Parfait pour** : lui montrer que tu penses à elle même quand tu dors encore, ou quand t'es occupé le matin.

---

## ⚙️ Configuration

Dans ton fichier `.env`, configure les paramètres :

```env
# Plage horaire (par défaut 8h-10h)
MORNING_START_HOUR=8
MORNING_END_HOUR=10

# Nombre de messages (par défaut 2-6)
MORNING_MIN_MESSAGES=2
MORNING_MAX_MESSAGES=6

# Mode de génération
USE_AI_MORNING=false
```

### 🎯 Paramètres expliqués

| Paramètre | Description | Valeur par défaut |
|-----------|-------------|-------------------|
| `MORNING_START_HOUR` | Heure de début d'envoi (format 24h) | `8` (8h00) |
| `MORNING_END_HOUR` | Heure de fin d'envoi (format 24h) | `10` (10h00) |
| `MORNING_MIN_MESSAGES` | Nombre minimum de messages | `2` |
| `MORNING_MAX_MESSAGES` | Nombre maximum de messages | `6` |
| `USE_AI_MORNING` | Utiliser l'IA pour générer les messages | `false` |

---

## 🤖 Mode IA vs Messages Prédéfinis

### Mode Messages Prédéfinis (`USE_AI_MORNING=false`)

**Avantages** :
- ✅ Gratuit (pas de coût OpenAI)
- ✅ Rapide
- ✅ 19 messages variés pré-écrits
- ✅ Toujours appropriés et naturels

**Messages inclus** :
- "Bonjour b ❤️"
- "Bien dormi ? 😊"
- "Bonne journée à l'école ✨"
- "Je pense à toi 💭"
- "Courage pour aujourd'hui 💪"
- "T'es la meilleure 🌟"
- "Passe une belle journée ☀️"
- Et 12 autres...

### Mode IA (`USE_AI_MORNING=true`)

**Avantages** :
- ✅ Messages uniques à chaque fois
- ✅ Plus de variété
- ✅ Contextuels et adaptatifs

**Inconvénients** :
- ❌ Coûte quelques centimes par jour (utilise GPT-4o-mini)
- ❌ Légèrement plus lent

---

## 🎬 Comment ça fonctionne ?

### Cycle journalier

1. **8h00** : Le scheduler vérifie s'il doit envoyer les messages
2. **Envoi** : Le bot choisit aléatoirement entre 2 et 6 messages
3. **Délais naturels** : Entre chaque message, attente de 2-8 minutes (aléatoire)
4. **Une fois par jour** : Les messages ne sont envoyés qu'une seule fois par jour

### Exemple de séquence

```
8:05 → "Bonjour b ❤️"
8:11 → "Bien dormi ? 😊"  (6 min plus tard)
8:15 → "Bonne journée à l'école ✨"  (4 min plus tard)
8:22 → "Je pense à toi 💭"  (7 min plus tard)
```

Total : 4 messages sur ~17 minutes, de manière naturelle.

---

## 🎮 Contrôles via l'interface web

### Boutons disponibles

| Bouton | Action |
|--------|--------|
| **🌅 Activer messages matinaux** | Active/désactive l'envoi automatique |
| **🧪 Tester messages matinaux** | Envoie immédiatement 2-6 messages de test |

### Indicateur de statut

Dans le tableau de bord, tu verras :
- **Messages Matinaux : Activé** (vert) = Les messages s'enverront automatiquement
- **Messages Matinaux : Désactivé** (rouge) = Aucun envoi automatique

---

## 🧪 Tester les messages

Pour tester sans attendre le matin :

1. **Via l'interface web** :
   - Clique sur "🧪 Tester messages matinaux"
   - Confirme l'envoi
   - Les messages seront envoyés immédiatement

2. **Via API** :
   ```bash
   curl -X POST http://localhost:3000/api/morning/test
   ```

---

## 📊 API Endpoints

Pour les développeurs :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/morning/toggle` | POST | Active/désactive les messages matinaux |
| `/api/morning/test` | POST | Envoie immédiatement des messages de test |
| `/api/morning/stats` | GET | Récupère les statistiques |
| `/api/morning/reset` | POST | Reset le flag d'envoi journalier |

### Exemple : Toggle

```bash
curl -X POST http://localhost:3000/api/morning/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### Exemple : Statistiques

```bash
curl http://localhost:3000/api/morning/stats
```

Réponse :
```json
{
  "isEnabled": true,
  "hasSentToday": true,
  "lastSentDate": "Mon Jan 27 2026",
  "totalMessagesSent": 28
}
```

---

## 🔧 Dépannage

### Les messages ne s'envoient pas

**Vérifications** :
1. ✅ Les messages matinaux sont **activés** (bouton vert dans l'interface)
2. ✅ L'heure actuelle est entre `MORNING_START_HOUR` et `MORNING_END_HOUR`
3. ✅ Les messages n'ont pas déjà été envoyés aujourd'hui
4. ✅ Le bot WhatsApp est connecté

**Solution** : Utilise le bouton "Tester messages matinaux" pour forcer un envoi.

### Je veux renvoyer les messages aujourd'hui

Les messages ne s'envoient qu'une fois par jour automatiquement.

**Solutions** :
1. Utilise le bouton **"🧪 Tester messages matinaux"** (envoi immédiat)
2. Utilise l'API : `POST /api/morning/test`

### Les messages sont trop/pas assez nombreux

Modifie `MORNING_MIN_MESSAGES` et `MORNING_MAX_MESSAGES` dans `.env` :

```env
# Pour 3-4 messages seulement
MORNING_MIN_MESSAGES=3
MORNING_MAX_MESSAGES=4
```

Puis redémarre le bot : `pm2 restart whatsapp-bot`

### Je veux changer les horaires

Modifie `MORNING_START_HOUR` et `MORNING_END_HOUR` dans `.env` :

```env
# Pour envoyer entre 7h et 9h
MORNING_START_HOUR=7
MORNING_END_HOUR=9
```

Puis redémarre le bot.

---

## 💡 Conseils d'utilisation

### ✅ Bonnes pratiques

- **Varie le nombre** : `MIN=2, MAX=6` donne une belle variété
- **Utilise le mode prédéfini** : Gratuit et naturel pour un usage quotidien
- **Teste avant** : Utilise le bouton test pour voir ce qu'elle recevra
- **Adapte les horaires** : Configure selon son emploi du temps réel

### ❌ À éviter

- Ne mets pas `MIN=MAX` (trop prévisible)
- N'envoie pas trop de messages (`MAX > 8` peut être lourd)
- Ne configure pas une plage horaire trop large

---

## 📝 Personnalisation avancée

### Ajouter tes propres messages prédéfinis

Édite le fichier [src/scheduler.js](src/scheduler.js:172-191) et modifie la fonction `getRandomPresetMessage()` :

```javascript
getRandomPresetMessage() {
  const messages = [
    "Bonjour b ❤️",
    "Bien dormi ? 😊",
    // Ajoute tes messages ici
    "Ton message personnalisé 💕",
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}
```

Puis redémarre le bot.

---

## 🎯 Exemples d'usage

### Scénario 1 : Messages discrets

```env
MORNING_START_HOUR=8
MORNING_END_HOUR=9
MORNING_MIN_MESSAGES=2
MORNING_MAX_MESSAGES=3
USE_AI_MORNING=false
```

→ 2-3 messages entre 8h et 9h, prédéfinis

### Scénario 2 : Plus présent

```env
MORNING_START_HOUR=7
MORNING_END_HOUR=10
MORNING_MIN_MESSAGES=4
MORNING_MAX_MESSAGES=6
USE_AI_MORNING=true
```

→ 4-6 messages entre 7h et 10h, générés par IA

### Scénario 3 : Juste un bonjour

```env
MORNING_START_HOUR=8
MORNING_END_HOUR=8
MORNING_MIN_MESSAGES=1
MORNING_MAX_MESSAGES=2
USE_AI_MORNING=false
```

→ 1-2 messages à 8h pile, prédéfinis

---

## 🚀 Résumé

Les messages matinaux c'est :
- ✅ **Automatique** : Une fois configuré, ça tourne tout seul
- ✅ **Naturel** : Délais aléatoires, messages variés
- ✅ **Personnalisable** : Horaires, nombre, contenu
- ✅ **Contrôlable** : Active/désactive quand tu veux
- ✅ **Testable** : Vérifie avant d'envoyer pour de vrai

**Parfait pour** montrer de l'attention sans effort quotidien ! 💕
