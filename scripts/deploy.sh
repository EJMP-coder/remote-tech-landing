#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  Remote Tech — Deploy de dist/ a Spaceship Web Hosting (cPanel)
#
#  Uso:   npm run deploy            (build + subida)
#         bash scripts/deploy.sh    (solo subida de dist/ existente)
#         DRY_RUN=1 bash scripts/deploy.sh   (simula, no cambia nada)
#
#  Credenciales en .env.deploy (NO se sube a git). Ver .env.deploy.example
#  Métodos:
#    rsync → SSH (cPanel → "SSH Access"; recomendado si tu plan lo incluye)
#    sftp  → SFTP con lftp   (sudo apt install lftp)
#    ftps  → FTP sobre TLS con lftp (cPanel → "FTP Accounts")
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.deploy}"
[[ -f "$ENV_FILE" ]] || { echo "✗ Falta $ENV_FILE (copia .env.deploy.example)"; exit 1; }
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

: "${DEPLOY_METHOD:?DEPLOY_METHOD requerido (rsync|sftp|ftps)}"
: "${DEPLOY_HOST:?DEPLOY_HOST requerido}"
: "${DEPLOY_USER:?DEPLOY_USER requerido}"
DEPLOY_PATH="${DEPLOY_PATH:-public_html}"
DRY_RUN="${DRY_RUN:-0}"

[[ -f dist/index.html && -f dist/.htaccess ]] || { echo "✗ dist/ incompleto: ejecuta npm run build"; exit 1; }

# Archivos del servidor que NUNCA deben borrarse con --delete
EXCLUDES=(".well-known" "cgi-bin" ".user.ini" "php.ini" "error_log" ".htpasswd")

echo "▶ Desplegando dist/ → ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH} (${DEPLOY_METHOD})"
[[ "$DRY_RUN" == "1" ]] && echo "  (modo simulación)"

case "$DEPLOY_METHOD" in
  rsync)
    PORT="${DEPLOY_PORT:-22}"
    args=(-rlvz --delete --chmod=D755,F644 -e "ssh -p ${PORT}")
    for e in "${EXCLUDES[@]}"; do args+=(--exclude "$e"); done
    [[ "$DRY_RUN" == "1" ]] && args+=(--dry-run)
    rsync "${args[@]}" dist/ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"
    ;;

  sftp|ftps)
    command -v lftp >/dev/null || { echo "✗ Instala lftp: sudo apt install lftp"; exit 1; }
    : "${DEPLOY_PASSWORD:?DEPLOY_PASSWORD requerido para sftp/ftps}"
    if [[ "$DEPLOY_METHOD" == "sftp" ]]; then
      URL="sftp://${DEPLOY_HOST}:${DEPLOY_PORT:-22}"
      SETTINGS="set sftp:auto-confirm yes;"
    else
      URL="ftp://${DEPLOY_HOST}:${DEPLOY_PORT:-21}"
      SETTINGS="set ftp:ssl-force true; set ftp:ssl-protect-data true; set ssl:verify-certificate ${DEPLOY_VERIFY_CERT:-yes};"
    fi
    excl=""
    for e in "${EXCLUDES[@]}"; do excl+=" --exclude-glob ${e}"; done
    dry=""; [[ "$DRY_RUN" == "1" ]] && dry="--dry-run"
    LFTP_PASSWORD="$DEPLOY_PASSWORD" lftp --env-password -u "$DEPLOY_USER" "$URL" -e "
      ${SETTINGS}
      set net:max-retries 3; set net:timeout 20;
      mirror -R --delete --verbose --parallel=4 ${dry} ${excl} dist/ ${DEPLOY_PATH}/;
      chmod 644 ${DEPLOY_PATH}/.htaccess ${DEPLOY_PATH}/contact.php ${DEPLOY_PATH}/index.html;
      bye"
    ;;

  *)
    echo "✗ DEPLOY_METHOD desconocido: $DEPLOY_METHOD"; exit 1 ;;
esac

echo "✓ Deploy completado."
if [[ "$DRY_RUN" != "1" && -n "${SITE_URL:-}" ]]; then
  echo "▶ Ejecutando verificación post-deploy contra ${SITE_URL}…"
  node scripts/post-deploy-check.mjs "$SITE_URL" || { echo "✗ La verificación detectó fallos"; exit 1; }
fi
