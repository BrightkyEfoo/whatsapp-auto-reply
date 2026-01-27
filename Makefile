.PHONY: help install build dev start clean docker-build docker-up docker-down docker-logs deploy

help: ## Affiche l'aide
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Installe les dépendances
	npm install

build: ## Build le projet TypeScript
	npm run build

dev: ## Lance en mode développement
	npm run dev

start: ## Lance le serveur en production
	npm run build
	npm start

clean: ## Nettoie les fichiers générés
	rm -rf dist node_modules

typecheck: ## Vérifie les types TypeScript
	npm run typecheck

# Docker commands
docker-build: ## Build l'image Docker
	docker-compose build

docker-up: ## Lance les conteneurs Docker
	docker-compose up -d

docker-down: ## Arrête les conteneurs Docker
	docker-compose down

docker-logs: ## Affiche les logs Docker
	docker-compose logs -f

docker-restart: ## Redémarre les conteneurs Docker
	docker-compose restart

docker-rebuild: ## Rebuild et relance les conteneurs
	docker-compose up -d --build

docker-clean: ## Nettoie les images Docker inutilisées
	docker image prune -f

# Deployment
deploy: ## Déploie sur le serveur (nécessite SERVER_IP)
	@if [ -z "$(SERVER_IP)" ]; then \
		echo "Erreur: Spécifiez SERVER_IP. Exemple: make deploy SERVER_IP=192.168.1.100"; \
		exit 1; \
	fi
	./deploy.sh $(SERVER_IP) $(USER)

# Test
test-env: ## Vérifie que .env est correctement configuré
	@if [ ! -f ".env" ]; then \
		echo "❌ Fichier .env introuvable"; \
		exit 1; \
	fi
	@echo "✅ Fichier .env présent"
	@grep -q "OPENAI_API_KEY=" .env && echo "✅ OPENAI_API_KEY configurée" || echo "❌ OPENAI_API_KEY manquante"
	@grep -q "GIRLFRIEND_NUMBER=" .env && echo "✅ GIRLFRIEND_NUMBER configurée" || echo "❌ GIRLFRIEND_NUMBER manquante"
