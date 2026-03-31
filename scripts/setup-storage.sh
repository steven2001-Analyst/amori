#!/bin/bash
# Setup Supabase Storage for Amori profile photos
SUPABASE_URL="https://qysepabvnoftgtisqdic.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2VwYWJ2bm9mdGd0aXNxZGljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg1NzQ3NCwiZXhwIjoyMDkwNDMzNDc0fQ.1Z707jR1zo66CF0f0X-wPonEZPIGumHDrJ3vZJSF2mA"

# Create storage bucket (idempotent) via Storage API
CREATE_RESULT=$(curl -s -w "\n%{http_code}" -X POST "${SUPABASE_URL}/storage/v1/bucket" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id": "photos", "name": "photos", "public": true, "file_size_limit": 5242880}')

HTTP_CODE=$(echo "$CREATE_RESULT" | tail -1)
BODY=$(echo "$CREATE_RESULT" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "Bucket 'photos' created successfully"
elif echo "$BODY" | rg -q "already exists"; then
  echo "Bucket 'photos' already exists"
else
  echo "Create bucket response (${HTTP_CODE}): ${BODY}"
fi

# Update bucket to ensure it's public
UPDATE_RESULT=$(curl -s -w "\n%{http_code}" -X PUT "${SUPABASE_URL}/storage/v1/bucket/photos" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "photos", "public": true, "file_size_limit": 5242880}')

HTTP_CODE=$(echo "$UPDATE_RESULT" | tail -1)
BODY=$(echo "$UPDATE_RESULT" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "Bucket 'photos' updated to public successfully"
else
  echo "Update bucket response (${HTTP_CODE}): ${BODY}"
fi

# Set CORS policy for the bucket to allow uploads from any origin
CORS_RESULT=$(curl -s -w "\n%{http_code}" -X POST "${SUPABASE_URL}/storage/v1/bucket/photos/cors" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "photos",
    "cors_config": {
      "headers": ["*"],
      "methods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
      "origins": ["*"],
      "max_age": 3600
    }
  }')

HTTP_CODE=$(echo "$CORS_RESULT" | tail -1)
BODY=$(echo "$CORS_RESULT" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "CORS policy set successfully"
else
  echo "CORS policy response (${HTTP_CODE}): ${BODY}"
fi

echo "Storage setup complete"
