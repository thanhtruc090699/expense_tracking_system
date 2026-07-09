# Bill Buddy - Ubuntu Setup

Minimal setup guide to run Bill Buddy on Ubuntu with Docker-based external services.

## 1. Install Requirements

Install Git, curl, jq, Docker, Docker Compose, Node.js and npm.

```bash
sudo apt update
sudo apt install -y git curl jq ca-certificates docker.io docker-compose-plugin nodejs npm
sudo systemctl enable --now docker
```

Check tools:

```bash
docker --version
docker compose version
node --version
npm --version
```

Clone the project and initialize the OCR submodule:

```bash
git clone <repository-url> bill-buddy
cd bill-buddy
git submodule update --init --recursive
```

## 2. Start PostgreSQL

```bash
docker run -d \
  --name bill-buddy-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=billbuddy \
  -e POSTGRES_PASSWORD=billbuddy \
  -e POSTGRES_DB=billbuddy \
  postgres:16
```

Backend database URL:

```env
DATABASE_URL="postgresql://billbuddy:billbuddy@localhost:5432/billbuddy?schema=public"
```

## 3. Start Keycloak

```bash
docker run -d \
  --name keycloak-local \
  -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.6.4 start-dev
```

Open:

```text
http://localhost:8080
```

Login:

```text
Username: admin
Password: admin
```

In Keycloak:

1. Create a realm named `bill-buddy`.
2. Go to `Clients`.
3. Import [documentation/keycloak/keycloak.json](documentation/keycloak/keycloak.json).
4. Save the client `bill-buddy-api`.
5. In client `bill-buddy-api`, create client roles:
   - `user`
   - `admin`
6. Create users under `Users`.
7. Set each user's password under `Credentials`.
8. Assign users the `user` role from client `bill-buddy-api`.
9. Assign `admin` too for admin accounts.

The app expects roles under client `bill-buddy-api`, not realm roles.

If the frontend is opened from another machine, add the correct URL to the client's `Valid redirect URIs` and `Web origins`, for example:

```text
http://<ubuntu-ip>:5173/*
```

## 4. Start OCR Service

Build the OCR Docker image:

```bash
docker build -f containers/Containerfile -t bill-buddy-ocr invoiceOCR/
```

Run OCR:

```bash
docker run -d \
  --name bill-buddy-ocr \
  -p 8000:8000 \
  bill-buddy-ocr
```

Backend OCR URL:

```env
INVOICE_OCR_URL=http://localhost:8000/scan
```

## 5. Configure and Run Backend

```bash
cd backend
cp .env.example .env
```

Set `backend/.env`:

```env
PORT=3000
BACKEND_URL=http://localhost:3000
DATABASE_URL="postgresql://billbuddy:billbuddy@localhost:5432/billbuddy?schema=public"
LISA_API_KEY=your-lisa-api-key-here
KEYCLOAK_ISSUER=http://localhost:8080/realms/bill-buddy
DISABLE_AUTH=false
INVOICE_OCR_URL=http://localhost:8000/scan
```

Install dependencies and run migrations:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

Start backend:

```bash
npm run start:dev
```

Backend runs at:

```text
http://localhost:3000
```

## 6. Configure and Run Frontend

```bash
cd ../frontend
cp .env.example .env
```

Set `frontend/.env`:

```env
VITE_ALLOWED_HOSTS=http://localhost
VITE_KEYCLOAK_URL=http://127.0.0.1:8080
```

Use the Keycloak URL that your browser can actually reach. Examples:

```env
# When opening the frontend on the same Ubuntu machine:
VITE_KEYCLOAK_URL=http://localhost:8080

# When opening the frontend from another machine in the same network:
VITE_KEYCLOAK_URL=http://<ubuntu-ip>:8080
```

Install dependencies and start frontend:

```bash
npm install
npm run dev 
```

Frontend runs at:

```text
http://localhost:5173
```

## 7. Start Existing Containers Later

After the first setup, start services again with:

```bash
docker start bill-buddy-postgres
docker start keycloak-local
docker start bill-buddy-ocr
```

Then start backend and frontend:

```bash
cd backend
npm run start:dev
```

```bash
cd frontend
npm run dev
```

## 8. Troubleshooting

### Keycloak shows `Invalid redirect_uri`

This means the frontend URL is not allowed in the Keycloak client.

In Keycloak:

1. Open `http://localhost:8080`.
2. Go to realm `bill-buddy`.
3. Go to `Clients` -> `bill-buddy-api`.
4. Open the client settings.
5. Add your frontend URL to `Valid redirect URIs`.
6. Add the same origin to `Web origins`.
7. Save the client.

For example, if your Ubuntu machine IP is `192.168.1.50` and Vite runs on port `5173`, add:

```text
Valid redirect URIs:
http://192.168.1.50:5173/*

Web origins:
http://192.168.1.50:5173
```

Also make sure `frontend/.env` uses the same reachable Keycloak URL:

```env
VITE_KEYCLOAK_URL=http://192.168.1.50:8080
```
