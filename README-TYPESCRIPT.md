# 📘 Migration TypeScript

## ✅ Conversion Complète

Tout le code a été migré de JavaScript vers TypeScript pour :
- Type safety
- Meilleure maintenance
- Autocomplétion dans l'IDE
- Détection d'erreurs à la compilation

## 📁 Structure

```
src/
├── index.ts        # Serveur Express + Socket.IO
├── whatsapp.ts     # Client WhatsApp
├── scheduler.ts    # Messages matinaux
├── ai.ts           # Intégration OpenAI
└── state.ts        # Gestion de l'état
```

## 🛠️ Développement

### Installation

```bash
npm install
```

### Mode développement (avec hot reload)

```bash
npm run dev
```

### Build

```bash
npm run build
```

Les fichiers compilés seront dans `dist/`.

### Démarrer en production

```bash
npm run build
npm start
```

### Vérifier les types

```bash
npm run typecheck
```

## 🐳 Docker

### Build local

```bash
docker-compose build
```

### Lancer

```bash
docker-compose up -d
```

### Voir les logs

```bash
docker-compose logs -f
```

### Arrêter

```bash
docker-compose down
```

## 🚀 Déploiement

Voir [DEPLOY.md](DEPLOY.md) pour le guide complet de déploiement Docker.

### Déploiement rapide

```bash
./deploy.sh [IP_SERVEUR] [UTILISATEUR]
```

Exemple :

```bash
./deploy.sh 192.168.1.100 root
```

## 📦 Makefile

Des commandes pratiques sont disponibles via Make :

```bash
make help              # Voir toutes les commandes
make install           # Installer les dépendances
make dev               # Lancer en dev
make build             # Build TypeScript
make docker-up         # Lancer avec Docker
make deploy SERVER_IP=x.x.x.x  # Déployer
```

## 🔧 Configuration TypeScript

Le fichier [tsconfig.json](tsconfig.json) contient :
- Target: ES2020
- Module: ESNext
- Strict mode activé
- Source maps activés
- Déclarations générées

## 📝 Avantages de TypeScript

### Type Safety

```typescript
// Avant (JS)
function increment(chatId) {
  const count = this.conversations.get(chatId) || 0;
  return count + 1;
}

// Après (TS)
increment(chatId: string): number {
  const count = this.conversations.get(chatId) || 0;
  return count + 1;
}
```

### Interfaces

```typescript
interface MessageInfo {
  from?: string;
  to?: string;
  body: string;
  timestamp: string;
  type?: string;
  messageCount?: number;
}
```

### Autocomplétion IDE

L'IDE connaît maintenant les types de toutes les variables et peut suggérer les propriétés/méthodes disponibles.

## 🔄 Comparaison JS vs TS

| Aspect | JavaScript | TypeScript |
|--------|-----------|-----------|
| Types | Dynamiques | Statiques |
| Erreurs | Runtime | Compile-time |
| Refactoring | Difficile | Facile |
| Documentation | Manuelle | Automatique |
| Taille code | Plus petit | Légèrement plus grand |

## 📚 Ressources

- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Docker Docs](https://docs.docker.com/)
- [Guide de Déploiement](DEPLOY.md)
