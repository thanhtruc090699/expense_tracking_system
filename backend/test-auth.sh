#!/bin/bash

# Keycloak configuration
KEYCLOAK_URL="http://10.0.0.2:8080/realms/bill-buddy"
CLIENT_ID="bill-buddy-api"
CLIENT_SECRET="tYVywbTqMgI2MVqUBqw9F0qTpEaNtYf0"
USERNAME="${KEYCLOAK_USERNAME:-testuser}"
PASSWORD="${KEYCLOAK_PASSWORD:-test123}"

# API configuration
API_URL="${API_URL:-http://localhost:3000}"

echo "=== Bill Buddy Auth Test ==="
echo "Keycloak: $KEYCLOAK_URL"
echo "API: $API_URL"
echo ""

# Get token
echo "Getting access token..."
RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "username=$USERNAME" \
  -d "password=$PASSWORD" \
  -d "grant_type=password")

# Check for errors
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  ERROR=$(echo "$RESPONSE" | jq -r '.error')
  ERROR_DESC=$(echo "$RESPONSE" | jq -r '.error_description')
  echo "Error: Failed to get token: $ERROR - $ERROR_DESC"
  exit 1
fi

TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expires_in')

echo "Got token (expires in ${EXPIRES_IN}s)"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Test authenticated request
echo "--- GET /bills (with token) ---"
curl -s "$API_URL/bills" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test without token
echo "--- GET /bills (without token) ---"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/bills")
BODY=$(echo "$RESPONSE" | head -n -1)
CODE=$(echo "$RESPONSE" | tail -n 1)

if [ "$CODE" = "401" ]; then
  echo "Correctly rejected (401 Unauthorized)"
else
  echo "Error: Expected 401, got $CODE"
fi
echo ""

# Decode and show token payload
echo "--- Token Payload ---"
PAYLOAD=$(echo "$TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '.')
echo "$PAYLOAD" | jq '{sub: .sub, email: .email, exp: .exp, iss: .iss}'
echo ""

echo "=== Done ==="
