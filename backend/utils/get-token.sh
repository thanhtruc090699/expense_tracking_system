#!/bin/bash

# Keycloak configuration
KEYCLOAK_URL="http://localhost:8080/realms/bill-buddy"
CLIENT_ID="bill-buddy-api"

SILENT=false
USERNAME=""
PASSWORD=""

# Parse arguments
while [[ $# -gt 0 ]]; do
	case $1 in
		-s|--silent)
			SILENT=true
			shift
			;;
		-u|--username)
			USERNAME="$2"
			shift 2
			;;
		-p|--password)
			PASSWORD="$2"
			shift 2
			;;
		*)
			echo "Usage: $0 [-s|--silent] [-u|--username <user>] [-p|--password <pass>]"
			exit 1
			;;
	esac
done

# Prompt for credentials if not provided
if [ -z "$USERNAME" ]; then
	read -p "Username: " USERNAME
fi
if [ -z "$PASSWORD" ]; then
	read -s -p "Password: " PASSWORD
	echo ""
fi

# Get token
RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/protocol/openid-connect/token" \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-d "client_id=$CLIENT_ID" \
	-d "username=$USERNAME" \
	-d "password=$PASSWORD" \
	-d "grant_type=password" \
	-d "scope=openid")

# Check for errors
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
	ERROR=$(echo "$RESPONSE" | jq -r '.error')
	ERROR_DESC=$(echo "$RESPONSE" | jq -r '.error_description')

	if [ "$SILENT" = true ]; then
		echo "Error: $ERROR - $ERROR_DESC" >&2
	else
		echo "Error: $ERROR - $ERROR_DESC"
	fi
	exit 1
fi

TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')

if [ "$SILENT" = true ]; then
	echo "$TOKEN"
else
	EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expires_in')
	echo ""
	echo "=== Access Token ==="
	echo "$TOKEN"
	echo ""
	echo "Expires in: ${EXPIRES_IN}s"
	echo ""
	echo "=== Usage ==="
	echo "curl -H \"Authorization: Bearer $TOKEN\" http://localhost:3000/api/endpoint"
fi
