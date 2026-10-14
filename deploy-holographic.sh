#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
# deploy-holographic.sh
# Deploys the TPNS Holographic Exchange Subsystem to
# holographic.lvhllc.org via Cloud Run + Cloud Build
# ─────────────────────────────────────────────────────────────

PROJECT_ID="lvllc"
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
gcloud run deploy "${SERVICE_NAME}" \
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
  --set-env-vars="TPNS_ENV=production"

echo ""
echo "[3/4] Retrieving service URL..."
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --format='value(status.url)')

echo "  Cloud Run URL: ${SERVICE_URL}"
echo ""

echo "[4/4] Smoke test..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SERVICE_URL}/healthz")
if [ "${HTTP_STATUS}" = "200" ]; then
  echo "  ✅ Health check passed (HTTP ${HTTP_STATUS})"
else
  echo "  ❌ Health check failed (HTTP ${HTTP_STATUS})"
  exit 1
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
