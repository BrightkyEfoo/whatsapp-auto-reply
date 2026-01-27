#!/bin/bash
#===============================================================================
# WhatsApp Auto-Reply Bot - Server-Side Deployment
# Uploads code, builds Docker image ON THE SERVER, and deploys
# Usage: ./deploy.sh [deploy|status|logs|restart|stop]
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Server config
SERVER="brightky@reservababi-vps"
SSH_KEY="/Users/macbookpro/.ssh/id_rsa"

# Obfuscated paths
DEPLOY_BASE="~/system/service/x7k9m2v4"
BOT_DIR="${DEPLOY_BASE}/whatsapp-svc"
NETWORK_NAME="x7k9-wbot-net"

# GitHub repo
REPO="git@github.com:BrightkyEfoo/whatsapp-auto-reply.git"
BRANCH="main"

# Obfuscated names
BOT_IMAGE="x7k9-wbot"
BOT_CONTAINER="x7k9-wbot-1"
PROJECT_NAME="whatsapp-auto-reply"

#===============================================================================
# LOGGING
#===============================================================================
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "\n${CYAN}=== $1 ===${NC}"; }

#===============================================================================
# SSH HELPER
#===============================================================================
ssh_exec() {
    ssh -i "$SSH_KEY" "$SERVER" "$1"
}

#===============================================================================
# DOCKER COMPOSE
#===============================================================================
DOCKER_COMPOSE="networks:
  ${NETWORK_NAME}:
    driver: bridge

volumes:
  whatsapp_session:
  whatsapp_logs:

services:
  ${BOT_CONTAINER}:
    image: ${BOT_IMAGE}:latest
    container_name: ${BOT_CONTAINER}
    restart: unless-stopped
    env_file:
      - .env
    environment:
      NODE_ENV: production
    volumes:
      - whatsapp_session:/app/.wwebjs_auth
      - whatsapp_logs:/app/logs
    ports:
      - \"127.0.0.1:3454:3000\"
    networks:
      - ${NETWORK_NAME}
    healthcheck:
      test: [\"CMD\", \"node\", \"-e\", \"require('http').get('http://localhost:3000/api/status', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})\"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s"

#===============================================================================
# DEPLOYMENT FUNCTIONS
#===============================================================================

check_requirements() {
    log_step "Vérification des prérequis"

    # Check if .env exists
    if [ ! -f ".env" ]; then
        log_error "Fichier .env introuvable"
        log_info "Créez un fichier .env à partir de .env.example"
        exit 1
    fi

    log_success "Fichier .env trouvé"
}

test_ssh_connection() {
    log_step "Test de connexion SSH"

    if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER" "echo ''" &> /dev/null; then
        log_success "Connexion SSH réussie"
    else
        log_error "Impossible de se connecter au serveur"
        log_info "Vérifiez que vous avez configuré l'accès SSH avec la clé: $SSH_KEY"
        exit 1
    fi
}

setup_server() {
    log_step "Configuration du serveur"

    ssh_exec "
        # Create directories
        mkdir -p ${BOT_DIR}/src

        echo 'Server ready'
    "
    log_success "Serveur configuré"
}

deploy_bot() {
    log_step "Déploiement du bot WhatsApp (build on server)"

    log_info "Écriture de la configuration Docker..."
    echo "$DOCKER_COMPOSE" | ssh_exec "cat > ${BOT_DIR}/docker-compose.yml"

    log_info "Upload du fichier .env..."
    scp -i "$SSH_KEY" .env "$SERVER:${BOT_DIR}/.env"

    log_info "Pull du code et build sur le serveur..."
    ssh_exec "
        cd ${BOT_DIR}

        # Clone or pull from GitHub
        if [ -d src/.git ]; then
            cd src && git fetch origin && git reset --hard origin/${BRANCH} && cd ..
        else
            rm -rf src
            git clone --depth 1 -b ${BRANCH} ${REPO} src
        fi

        # Copy .env into source for build
        cp .env src/.env

        cd src

        # Build Docker image
        echo 'Build de l image Docker (cela peut prendre quelques minutes)...'
        docker build -t ${BOT_IMAGE}:latest .

        cd ..

        # Stop and remove old container
        docker compose down 2>/dev/null || true

        # Start new container
        docker compose up -d

        echo 'Bot déployé avec succès!'
    "
    log_success "Bot déployé"
}

check_status() {
    log_step "Statut du déploiement"

    ssh_exec "
        echo '=== Docker Container ==='
        docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E '(${BOT_CONTAINER}|NAMES)' || echo 'Container non trouvé'

        echo ''
        echo '=== Service Health ==='
        status=\$(docker inspect --format='{{.State.Status}}' ${BOT_CONTAINER} 2>/dev/null || echo 'not found')
        health=\$(docker inspect --format='{{.State.Health.Status}}' ${BOT_CONTAINER} 2>/dev/null || echo 'N/A')
        printf '%-20s %s (health: %s)\n' '${BOT_CONTAINER}:' \"\$status\" \"\$health\"

        echo ''
        echo '=== Bot Logs (dernières 10 lignes) ==='
        docker logs --tail 10 ${BOT_CONTAINER} 2>&1 || echo 'Pas de logs'

        echo ''
        echo '=== Volumes ==='
        docker volume ls | grep whatsapp || echo 'Pas de volumes'
    "
}

view_logs() {
    log_step "Logs du bot"
    ssh_exec "docker logs -f --tail 100 ${BOT_CONTAINER}"
}

restart_bot() {
    log_step "Redémarrage du bot"
    ssh_exec "cd ${BOT_DIR} && docker compose restart"
    log_success "Bot redémarré"
    sleep 3
    check_status
}

stop_bot() {
    log_step "Arrêt du bot"
    ssh_exec "cd ${BOT_DIR} && docker compose down"
    log_success "Bot arrêté"
}

start_bot() {
    log_step "Démarrage du bot"
    ssh_exec "cd ${BOT_DIR} && docker compose up -d"
    log_success "Bot démarré"
    sleep 3
    check_status
}

show_qr_url() {
    log_step "URL d'accès"
    echo ""
    log_info "Interface web: http://reservababi-vps:3454"
    log_info "ou via IP: http://[IP_DU_SERVEUR]:3454"
    echo ""
    log_warn "Scanner le QR code pour connecter WhatsApp"
    echo ""
}

backup_session() {
    log_step "Backup de la session WhatsApp"

    BACKUP_FILE="whatsapp-session-backup-$(date +%Y%m%d-%H%M%S).tar.gz"

    ssh_exec "
        docker run --rm \
          -v ${BOT_DIR##*/}_whatsapp_session:/data \
          -v /tmp:/backup \
          alpine tar czf /backup/${BACKUP_FILE} /data
    "

    log_info "Téléchargement du backup..."
    scp -i "$SSH_KEY" "$SERVER:/tmp/${BACKUP_FILE}" "./${BACKUP_FILE}"

    ssh_exec "rm /tmp/${BACKUP_FILE}"

    log_success "Backup sauvegardé: ${BACKUP_FILE}"
}

show_help() {
    cat << EOF
WhatsApp Auto-Reply Bot - Script de Déploiement
Usage: $0 [command]

Commands:
  deploy        Déployer le bot (build + start)
  status        Voir le statut du déploiement
  logs          Voir les logs en temps réel
  restart       Redémarrer le bot
  stop          Arrêter le bot
  start         Démarrer le bot
  backup        Backup de la session WhatsApp
  help          Afficher cette aide

Examples:
  $0              # Déployer (par défaut)
  $0 deploy       # Déployer explicitement
  $0 status       # Voir le statut
  $0 logs         # Voir les logs
  $0 restart      # Redémarrer le bot
  $0 backup       # Backup de la session

Configuration:
  Serveur: ${SERVER}
  Répertoire: ${BOT_DIR}
  Container: ${BOT_CONTAINER}
  Network: ${NETWORK_NAME}

EOF
}

#===============================================================================
# MAIN
#===============================================================================

main() {
    local cmd="${1:-deploy}"

    echo -e "${CYAN}"
    echo "========================================================"
    echo "     WhatsApp Auto-Reply Bot - Déploiement            "
    echo "========================================================"
    echo -e "${NC}"

    case "$cmd" in
        deploy)
            check_requirements
            test_ssh_connection
            setup_server
            deploy_bot
            check_status
            show_qr_url
            log_success "Déploiement terminé!"
            ;;
        status)
            check_status
            ;;
        logs)
            view_logs
            ;;
        restart)
            restart_bot
            ;;
        stop)
            stop_bot
            ;;
        start)
            start_bot
            ;;
        backup)
            backup_session
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Commande inconnue: $cmd"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
