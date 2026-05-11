# Bill Buddy Backend

NestJS backend for Bill Buddy API with OpenAPI-first development.

## Project Structure

### Generated Code (`src/generated/`)

Code generated from OpenAPI specs:

- **`models/`** - DTOs from OpenAPI spec (Bill, CreateBillDto, UpdateBillDto, etc.)
- **`api/BillsApi.ts`** - Abstract class defining the API interface
- **`api-implementations.ts`**, **`api.module.ts`** - Not used (we have our own implementations)

### Application Code (`src/bills/`)

Hand-written business logic:

- **`bills.constants.ts`** - DI provider token
- **`bills.controller.ts`** - NestJS controller using generated types
- **`bills.impl.ts`** - Implementation of the generated `BillsApi` interface
- **`bills.service.ts`** - Business logic with Prisma
- **`bills.module.ts`** - Module wiring everything together

## Regenerating Code

After updating the OpenAPI spec, regenerate the code:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i ./api-spec/openapi.yaml \
  -g typescript-nestjs-server \
  -o ./src/generated
```

## API Specs

OpenAPI specs are located in `api-spec/`:

- `bills.yaml` - Bills endpoint specification
- `users.yaml` - Users endpoint specification
- `lisa.yaml` - Lisa AI endpoint specification
- `openapi.yaml` - Aggregator file that references all domain specs

## Generate Documentation

Generate static HTML documentation from OpenAPI spec:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i ./api-spec/openapi.yaml \
  -g html2 \
  -o docs
```

The generated docs will be available at `docs/index.html`.
