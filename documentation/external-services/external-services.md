# External Services and Configuration Options

This document summarizes the external services currently used by Bill Buddy and the main configuration points for each one.

## 1. Keycloak / OpenID Connect

### Purpose
Keycloak is used for authentication and authorization of the backend API. The application validates JWT access tokens issued by Keycloak before allowing access to protected endpoints.

### How it is used
- The backend reads the JWT from the Authorization header.
- It validates the token against the Keycloak JWKS endpoint.
- It extracts the user identity and roles and creates or updates a local user record.

### Docker setup (optional)
For local development, Keycloak can be started with Docker. If you prefer, you can also disable authentication in the backend by setting DISABLE_AUTH=true.

#### Step 1: Run Keycloak locally
```powershell
docker run -p 127.0.0.1:8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:26.6.4 start-dev
```

Or run it in detached mode:
```powershell
docker run -d -p 127.0.0.1:8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin --name keycloak-local quay.io/keycloak/keycloak:26.6.4 start-dev
```

Keycloak Admin Console: http://localhost:8080
- Username: admin
- Password: admin

#### Step 2: Create the realm and import the client configuration
1. Open the Keycloak Admin Console.
2. Create a new realm named bill-buddy.
3. Go to Clients and import the file [documentation/keycloak/keycloak.json](keycloak/keycloak.json).
4. Save the client configuration.

#### Step 3: Create a test user
1. Go to Users and create a new user.
2. Set a username and email.
3. Set a password under Credentials.
4. Make sure the user has the required roles for the application.

#### Useful commands
```powershell
docker logs keycloak-local
docker stop keycloak-local
docker start keycloak-local
docker rm -f keycloak-local
docker restart keycloak-local
```

### Configuration options
- KEYCLOAK_ISSUER: Base issuer URL of the Keycloak realm, for example:
  - http://localhost:8080/realms/bill-buddy
- DISABLE_AUTH: Set to true to bypass real authentication for local development and use a mock user instead.

### Notes
- The backend expects tokens to be signed with RS256.
- The issuer URL must match the realm configured in Keycloak.
- The application uses the role information from the token under the client role group bill-buddy-api.

---

## 2. LISA AI Service

### Purpose
LISA is used as the AI assistant for financial conversations, bill analysis, and invoice validation/processing.

### How it is used
- The backend sends user-specific financial context to the LISA API.
- LISA can answer questions about spending patterns and help validate or process invoice data.

### Configuration options
- LISA_API_KEY: Required API key for authentication with the LISA service. If it is missing, the backend returns a service-unavailable error.
- Model selection: The application uses lisa-pro-03-2026 by default, but the request payload can override it.
- Endpoint: The current implementation targets:
  - https://chat-1.ki-awz.iisys.de/api/chat/completions

### Request format
The backend sends a POST request to the LISA chat completions endpoint with a JSON body. The payload contains the selected model and a list of chat messages, and the request is authenticated with a Bearer token.

Example shape:
```json
{
  "model": "lisa-pro-03-2026",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Tell me a funny joke!" }
  ]
}
```

The attached SDK examples in [documentation/lisa-sdk/lisa_openai_sdk.txt](lisa-sdk/lisa_openai_sdk.txt) and [documentation/lisa-sdk/lisa_raw_http.txt](lisa-sdk/lisa_raw_http.txt) show the same pattern using the OpenAI SDK and raw HTTP respectively.

### Notes
- The service can be adapted to a different endpoint or self-hosted LISA deployment by changing the backend integration.
- The user context sent to LISA is built from recent expenses, summaries, and budget data.

---

## 3. Invoice OCR Service

### Purpose
The OCR service extracts text and structured information from uploaded receipts or invoice images.

### How it is used
- The backend uploads the scanned file to the OCR endpoint using multipart/form-data.
- The OCR response is then used as input for invoice processing.

### Docker setup
The invoice OCR service can be started locally with Docker.

#### Step 1: Initialize Git submodules
```powershell
git submodule update --init --recursive
```

#### Step 2: Build the OCR Docker image
```powershell
docker build -f containers/Containerfile -t bill-buddy-ocr invoiceOCR/
```

#### Step 3: Run the OCR container
```powershell
docker run -d -p 8000:8000 --name bill-buddy-ocr bill-buddy-ocr
```

The OCR service will be available at http://localhost:8000.

#### Useful commands
```powershell
docker logs bill-buddy-ocr
docker stop bill-buddy-ocr
docker start bill-buddy-ocr
docker rm -f bill-buddy-ocr
docker build -f containers/Containerfile -t bill-buddy-ocr invoiceOCR/
```

### Configuration options
- INVOICE_OCR_URL: URL of the OCR endpoint. Default value:
  - http://localhost:8000/scan
- Request options that can be sent to the OCR service include:
  - lang
  - psm
  - oem
  - min_conf
  - pdf_mode
  - include_tokens

### Notes
- The OCR service should support file uploads and return JSON data that the backend can process.

---

## Summary

The application currently depends on three main external services:

1. Keycloak for identity and access control
2. LISA for AI-based financial assistance and invoice processing
3. An OCR service for document scan extraction

Each service can be configured through environment variables or by adapting the backend integration endpoint and request parameters.
