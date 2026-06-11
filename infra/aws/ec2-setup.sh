#!/usr/bin/env bash
set -euo pipefail

# DocuMind AI EC2 bootstrap script
#
# Assumptions:
# - Amazon Linux 2023 or Ubuntu 22.04+
# - This repository already exists on the EC2 instance
# - A production .env file exists at the repository root
# - Docker image builds happen locally on the EC2 host

APP_DIR="${APP_DIR:-/opt/documind}"
APP_USER="${APP_USER:-ec2-user}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/aws/production-docker-compose.yml}"

echo "[1/7] Installing Docker, Git, and the Docker Compose plugin"

if command -v dnf >/dev/null 2>&1; then
  sudo dnf update -y
  sudo dnf install -y docker git
elif command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y docker.io docker-compose-plugin git
else
  echo "Unsupported package manager. Install Docker and Docker Compose manually."
  exit 1
fi

if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is not available. Install it before continuing."
  exit 1
fi

echo "[2/7] Enabling and starting Docker"
sudo systemctl enable docker
sudo systemctl start docker

echo "[3/7] Ensuring the application user can run Docker"
if id "${APP_USER}" >/dev/null 2>&1; then
  sudo usermod -aG docker "${APP_USER}" || true
fi

echo "[4/7] Creating the application directory"
sudo mkdir -p "${APP_DIR}"
sudo chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "[5/7] Verifying repository and environment files"
if [ ! -f "${APP_DIR}/.env" ]; then
  echo "Missing ${APP_DIR}/.env. Copy the production environment file before running this script."
  exit 1
fi

if [ ! -f "${APP_DIR}/${COMPOSE_FILE}" ]; then
  echo "Missing ${APP_DIR}/${COMPOSE_FILE}. Copy or clone the repository contents to ${APP_DIR}."
  exit 1
fi

echo "[6/7] Pulling the latest repository changes if this is a Git checkout"
if [ -d "${APP_DIR}/.git" ]; then
  git -C "${APP_DIR}" pull --ff-only || true
fi

echo "[7/7] Building and starting DocuMind AI containers"
cd "${APP_DIR}"
docker compose --env-file .env -f "${COMPOSE_FILE}" up -d --build

cat <<'EOF'

Deployment complete.

Firewall and security group notes:
- Allow inbound 80/tcp to the EC2 instance for the nginx frontend.
- Allow inbound 22/tcp only from trusted admin IPs.
- Do not expose 8080 publicly unless you explicitly want direct backend access.
- Prefer a reverse proxy or ALB in front of the frontend/backend if this will be public.
- Keep the RDS security group restricted to the EC2 security group only.

Recommended validation:
- docker compose -f infra/aws/production-docker-compose.yml ps
- curl http://localhost:8080/actuator/health
- curl http://localhost/

EOF
