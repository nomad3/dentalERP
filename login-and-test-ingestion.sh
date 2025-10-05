#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
API="$BACKEND_URL/api"

# Login and get token/practice ID
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"admin@practice.com","password":"Admin123!"}' "$API/auth/login")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
PRACTICE_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.currentPracticeId')

if [[ -z "$TOKEN" || -z "$PRACTICE_ID" || "$TOKEN" == "null" || "$PRACTICE_ID" == "null" ]]; then
  echo "Failed to get token or practice ID from login response."
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "Login successful. Token and Practice ID obtained."

# --- Test Dentrix PDF ---
echo "Uploading Dentrix PDF (Torrey Pines)..."
DENTRIX_JOB=$(curl -s -H "Authorization: Bearer $TOKEN" \
  -F "practiceId=$PRACTICE_ID" \
  -F "sourceSystem=dentrix" \
  -F "dataset=appointments" \
  -F "file=@examples/ingestion/Torrey Pines - Day Sheet 08 - 2025.pdf" \
  "$API/integrations/ingestion/upload" | jq -r '.job.id')
echo "Dentrix Job ID: $DENTRIX_JOB"

echo "Processing Dentrix job..."
curl -s -H "Authorization: Bearer $TOKEN" -X POST "$API/integrations/ingestion/jobs/$DENTRIX_JOB/process" | jq .

# --- Test Eaglesoft PDF ---
echo "Uploading Eaglesoft PDF (Eastlake)..."
EAGLESOFT_JOB=$(curl -s -H "Authorization: Bearer $TOKEN" \
  -F "practiceId=$PRACTICE_ID" \
  -F "sourceSystem=eaglesoft" \
  -F "dataset=appointments" \
  -F "file=@examples/ingestion/Eastlake Day 06 2025.pdf" \
  "$API/integrations/ingestion/upload" | jq -r '.job.id')
echo "Eaglesoft Job ID: $EAGLESOFT_JOB"

echo "Processing Eaglesoft job..."
curl -s -H "Authorization: Bearer $TOKEN" -X POST "$API/integrations/ingestion/jobs/$EAGLESOFT_JOB/process" | jq .

echo "Done."
