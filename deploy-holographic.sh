#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
# deploy-holographic.sh
# Deploys the TPNS Holographic Exchange Subsystem to
# holographic.lvhllc.org via Cloud Run + Cloud Build
# ─────────────────────────────────────────────────────────────

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"
SERVICE_NAME="tpns-holographic-exchange"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
SUBDOMAIN="holographic.lvhllc.org"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  TPNS Holographic Exchange — Cloud Run Deployment        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Build & push image via Cloud Build
echo "[1/4] Building container image via Cloud Build..."
gcloud builds submit \
  --project="${PROJECT_ID}" \
  --tag="${IMAGE}:latest" \
  --timeout=600s \
  .

echo ""
echo "[2/4] Deploying to Cloud Run (${REGION})..."
DEPLOY_OUT=$(gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --image="${IMAGE}:latest" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --min-instances=0 \
  --max-instances=3 \
  --memory=256Mi \
  --cpu=1 \
  --set-env-vars="TPNS_ENV=production" 2>&1)
echo "${DEPLOY_OUT}"

# Extract the canonical URL directly from deploy output
SERVICE_URL=$(echo "${DEPLOY_OUT}" | grep -o 'https://[^ ]*\.run\.app' | tail -1)

# Fallback: ask describe if grep missed it
if [ -z "${SERVICE_URL}" ]; then
  SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
    --project="${PROJECT_ID}" \
    --region="${REGION}" \
    --format='value(status.url)')
fi

echo ""
echo "[3/4] Service URL: ${SERVICE_URL}"
echo ""

echo "[4/4] Smoke test (30s warm-up)..."
sleep 5
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SERVICE_URL}/healthz" --max-time 15)
if [ "${HTTP_STATUS}" = "200" ]; then
  echo "  ✅ Health check passed (HTTP ${HTTP_STATUS})"
else
  echo "  ⚠️  Health check returned HTTP ${HTTP_STATUS} — service is live at:"
  echo "     ${SERVICE_URL}"
  echo "     (Verify manually: curl ${SERVICE_URL}/)"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Deployment complete!                                  ║"
echo "║                                                          ║"
echo "║  Cloud Run: ${SERVICE_URL}"
echo "║  Next: Map ${SUBDOMAIN} → Cloud Run in GCP               ║"
echo "║         (Cloud Run Domain Mappings or GCLB)              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  DNS step — run once after first deploy:"
echo "  gcloud beta run domain-mappings create \\"
echo "    --service=${SERVICE_NAME} \\"
echo "    --domain=${SUBDOMAIN} \\"
echo "    --region=${REGION} \\"
echo "    --project=${PROJECT_ID}"
echo ""
