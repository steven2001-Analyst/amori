#!/bin/bash
SUPABASE_URL="https://qysepabvnoftgtisqdic.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2VwYWJ2bm9mdGd0aXNxZGljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg1NzQ3NCwiZXhwIjoyMDkwNDMzNDc0fQ.1Z707jR1zo66CF0f0X-wPonEZPIGumHDrJ3vZJSF2mA"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "${SUPABASE_URL}/storage/v1/bucket/photos" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name":"photos","public":true,"file_size_limit":5242880,"allowed_mime_types":["image/jpeg","image/png","image/webp"]}')
echo "Bucket status: $STATUS"
