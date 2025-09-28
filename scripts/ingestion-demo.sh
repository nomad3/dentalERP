#!/usr/bin/env bash
set -euo pipefail

# Simple demo script to test manual ingestion endpoints with sample data
# Requirements: curl, jq

API_BASE_URL=${API_BASE_URL:-http://localhost:3001/api}
EMAIL=${EMAIL:-executive@practice.com}
PASSWORD=${PASSWORD:-Demo123!}

echo "Logging in as $EMAIL ..." >&2
LOGIN_JSON=$(curl -sSf -X POST "$API_BASE_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for this script. Install jq and re-run." >&2
  exit 1
fi

ACCESS_TOKEN=$(echo "$LOGIN_JSON" | jq -r .accessToken)
PRACTICE_ID=$(echo "$LOGIN_JSON" | jq -r '.practices[0].id')
if [[ -z "${ACCESS_TOKEN:-}" || "$ACCESS_TOKEN" == "null" ]]; then
  echo "Failed to obtain access token. Response:" >&2
  echo "$LOGIN_JSON" | jq . >&2
  exit 1
fi
echo "Got token. Using practice: $PRACTICE_ID" >&2

auth() { curl -sSf -H "Authorization: Bearer $ACCESS_TOKEN" "$@"; }
auth_json() { curl -sSf -H "Authorization: Bearer $ACCESS_TOKEN" -H 'Content-Type: application/json' "$@"; }

echo "Uploading CSV ..." >&2
CSV_UPLOAD=$(curl -sSf -X POST "$API_BASE_URL/integrations/ingestion/upload" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F practiceId="$PRACTICE_ID" -F sourceSystem="dentrix" -F dataset="patients" \
  -F file=@examples/ingestion/patients.csv;type=text/csv)
CSV_JOB_ID=$(echo "$CSV_UPLOAD" | jq -r .job.id)
echo "CSV job: $CSV_JOB_ID" >&2

echo "Processing CSV job ..." >&2
auth -X POST "$API_BASE_URL/integrations/ingestion/jobs/$CSV_JOB_ID/process" | jq .

echo "Fetching headers ..." >&2
auth "$API_BASE_URL/integrations/ingestion/jobs/$CSV_JOB_ID/headers" | jq .

echo "Saving mapping ..." >&2
MAPPING_BODY=$(jq -c \
  --arg practiceId "$PRACTICE_ID" \
  '.practiceId=$practiceId | .dataset="patients" | .sourceSystem="dentrix"' \
  examples/ingestion/patients_mapping.json)
auth_json -X POST "$API_BASE_URL/integrations/ingestion/jobs/$CSV_JOB_ID/map" -d "$MAPPING_BODY" | jq .

echo "Promoting patients ..." >&2
PROMOTE_BODY=$(jq -c '{target:"patients", fieldMap:.fieldMap}' examples/ingestion/patients_mapping.json)
auth_json -X POST "$API_BASE_URL/integrations/ingestion/jobs/$CSV_JOB_ID/promote" -d "$PROMOTE_BODY" | jq .

echo "Uploading JSON ..." >&2
JSON_UPLOAD=$(curl -sSf -X POST "$API_BASE_URL/integrations/ingestion/upload" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F practiceId="$PRACTICE_ID" -F sourceSystem="open_dental" -F dataset="patients_json" \
  -F file=@examples/ingestion/patients.json;type=application/json)
JSON_JOB_ID=$(echo "$JSON_UPLOAD" | jq -r .job.id)
echo "JSON job: $JSON_JOB_ID" >&2

echo "Processing JSON job ..." >&2
auth -X POST "$API_BASE_URL/integrations/ingestion/jobs/$JSON_JOB_ID/process" | jq .

echo "Promoting JSON patients ..." >&2
PROMOTE_JSON_BODY=$(jq -c '{target:"patients", fieldMap:.fieldMap}' examples/ingestion/patients_mapping.json)
auth_json -X POST "$API_BASE_URL/integrations/ingestion/jobs/$JSON_JOB_ID/promote" -d "$PROMOTE_JSON_BODY" | jq .

echo "Done." >&2
