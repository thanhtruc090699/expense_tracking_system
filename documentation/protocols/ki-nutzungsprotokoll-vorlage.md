# KI-Nutzungsprotokoll zur Studienarbeit

## Angaben zur Arbeit

- Gruppenname: Blue Team
- Titel der Studienarbeit: 
- KI genutzt: ja
- Verwendete KI-Werkzeuge:

Wenn keine KI genutzt wurde, reicht hier die Angabe "nein". In diesem Fall müssen die folgenden Abschnitte nicht ausgefüllt werden.

## Kurz-Erklärung

Dieses Protokoll wird als Markdown-Datei im Git-Repository der Gruppe geführt.
Wesentliche KI-Nutzungen werden hier kurz und zeitnah dokumentiert.
Die Nachvollziehbarkeit über Versionen ergibt sich aus der Git-Historie dieser Datei.

Für diese Studienarbeit wurden KI-Werkzeuge als Unterstützung verwendet.
Die wesentlichen Nutzungen sind unten dokumentiert.
Alle übernommenen Inhalte wurden fachlich geprüft, bei Bedarf angepasst und in die Arbeit eigenverantwortlich integriert.

## Übersicht der KI-Nutzung

Tragen Sie hier die wesentlichen Nutzungen ein.
Wenn ähnliche Nutzungen in engem Zusammenhang stehen, können Sie sie zusammenfassen.
Pflegen Sie das Protokoll möglichst zeitnah, damit die Git-Historie die Entwicklung nachvollziehbar macht. Nutzen Sie KI, um Ihren Promtverlauf entsprechnd dieser Vorlage festzuhalten.  

| Datum | Anwender der KI | Werkzeug | Nutzung kurz beschrieben | Übernahme und Anpassung kurz beschrieben |
| --- | --- | --- | --- | --- |
| 10.05.2026 | Truc Trinh | ChatGPT | Unterstützung bei der Erweiterung der OpenAPI-Spezifikation für die Budgets API (PATCH Endpoint und Error Responses) | YAML-Dateien manuell angepasst, OpenAPI-Code neu generiert, PATCH-Route implementiert sowie Backend-Build und Route-Mapping erfolgreich geprüft |
| 11.05.2026 | Rathin | Claude Haiku 4.5 | Added new status codes for errors | new 400 series status codes for all endpoints were suggested and added by agent. New endpoint to search merchant by name was suggested according to described requirement and was finetuned by agent. |
| 14.05.2026 | Truc Trinh | ChatGPT | Unterstützung bei der Überarbeitung der Lisa-API-Spezifikation, insbesondere Erweiterung des `/lisa/process` Endpoints um zusätzliche Error Responses und ein neues `task`-Feld im Request Body | Vorschläge geprüft und manuell in die OpenAPI-YAML-Datei übernommen. Error Responses ergänzt und `task`-Feld angepasst, um AI-Verarbeitungsarten wie Kategorisierung, Validierung und Vorschläge klarer zu definieren sowie Backend-Routing, Testing und Audit Logging zu unterstützen |
| 21.05.2026 | Rathin | Claude Haiku 4.5 | New OCR endpoint | Updated api-spec with new endpoint for business logic to keep it modular and accessible. Added new changes to backend logic for controller and module to avoid generate errors |
| 21.05.2026 | Rathin | Claude Haiku 4.5 | Fixed errors for /process-invoice | Created new type declarations for raw ocr response and added dependencies to other api endpoints like expenses, expense-items and merchants. Updated module files and created boiler plate with all the imports for process-ocr-invoice-service.ts page |
| 23.05.2026 | Truc Trinh | ChatGPT | Unterstützung beim Aufbau der Budgets-API-Logik gemäß OpenAPI-Contract | Backend-Struktur aus Controller, Impl, Service und Module analysiert.<br>Business-Logik aus der Impl-Schicht in den Service ausgelagert.<br>Budget-Endpunkte gemäß OpenAPI-Schema umgesetzt.<br>Request-/Response-Strukturen und Error Handling geprüft. |
| 25.05.2026 | Truc Trinh | ChatGPT | Unterstützung bei der Entwicklung und Fehleranalyse der LISA-Integration gemäß OpenAPI-Contract | LISA-Logik service-seitig neu aufgebaut, `impl` auf Contract-Mapping beschränkt, Request-/Response-Schema geprüft, `data`-Payload gemäß OpenAPI angepasst, Error Handling erweitert und API-Key-, Header-, Model- sowie Upstream-Fehler systematisch analysiert und dokumentiert |
| 27.05.2026 | Ivan | lisa-pro-03-2026 | OCR DTOs from spec | Added ProcessInvoiceRequestDto, ProcessedInvoice, and ProcessInvoiceResponse schemas to ocr.yaml, activated them in openapi.yaml, regenerated code to auto-generate DTOs instead of manual implementation, removed manual DTO files, updated controller and service to use generated types |
| 29.05.2026 | Truc Trinh | ChatGPT | Unterstützung bei der Implementierung der LISA-Logik für den Endpoint `/lisa/process` zur Validierung von OCR-Scan-Ergebnissen und zur Kategorie-Vorschlagslogik | LISA-Validierung wurde als finale Verarbeitungsschicht nach dem OCR-Scan konzipiert. Die Logik wurde in den `LisaService` verschoben, der generated implementation layer bleibt schlank. Zusätzlich wurden Utilities zum Parsen der LISA-JSON-Antwort und zum Handling von LISA-API-Fehlern ergänzt. |
| 01.06.2026 | Rathin | Co-Pilot | Criticism for contradictory status codes and improvement | Looked for inconsistencies in the yaml files for status codes and proper reasoning. Made changes in all files to add id format to uuid and removed 400 status where not needed and replaced some with 422. |
| 11.06.2026 | Ivan | lisa-pro-03-2026 | Expense Summary Endpoint | Updated OpenAPI spec with new `/expenses/summary` endpoint and added corresponding backend implementation (controller, service, impl). |
| 11.06.2026 | Rathin | Lisa Pro | api-spec: expense.yaml error codes | generated missing error status codes for all methods 401, 401, 404, 422 |
| 11.06.2026 | Rathin | Lisa Pro | Created seeding script | Updated data-seed script to add mock data to test new api |
| 11.06.2026 | Rathin | Lisa Pro | Figma to Code | Converted figma design to code via a new project and strategically merged the changes to main project to redesign whole frontend according to the rendered Figma design. |
| 13.06.2026 | Rathin | Lisa Pro | Figma to Code - Expense Page | Added new elements and fixed frontend |
| 13.06.2026 | Rathin | Lisa Pro | Database Migrations and Seeders | Removed all outdated migrations and added a new migration file according to new specs and schema. Also added new data to the seeder script for testing new features |
| 14.06.2026 | Truc Trinh | OpenAI Codex | Lisa invoice validation and processing flow | Updated `lisa.yaml` and `openapi.yaml` with a separate `/lisa/process-invoice` endpoint, regenerated backend OpenAPI artifacts, aligned generated `LisaApi` signatures with controller, impl and service code, and kept `/lisa/analyze-bill` as the validation-only endpoint. |
| 14.06.2026 | Truc Trinh | OpenAI Codex | Lisa OCR and category-based invoice analysis | Adjusted the backend flow so Lisa receives the uploaded receipt image, OCR is called from the backend, categories are loaded from the database, and the prompt was refined to keep only real purchased products with name, quantity, price, total price and category data. |
| 14.06.2026 | Truc Trinh | OpenAI Codex | Fixing Lisa API response mapping and frontend handling | Investigated backend/frontend mismatch for receipt scan results, adapted response handling so validated invoice data can be mapped to the frontend form, and checked the backend build after generated model updates. |
| 14.06.2026 | Truc Trinh | OpenAI Codex | Allow uncategorized expense items | Fixed Prisma error `P2011` for `expense_items.category_id` by allowing nullable category IDs in `expense-items.yaml`, regenerating models, updating service typing, adding a migration to drop the database NOT NULL constraint, and verifying the backend build. |
| 15.06.2026 | Hanna | OpenAI Codex | Delete modal | Replaced browser confirm dialogs with a shared delete confirmation modal across pages. |
| 15.06.2026 | Hanna| OpenAI Codex | Analytics page | Implemented analytics page from Figma with spending trend, export buttons, category breakdown, and insight cards. |
| 15.06.2026 | Truc Trinh | lisa-pro-03-2026 | Refactor Lisa process-invoice to support updating existing expenses | Updated `lisa.service.ts` method `lisaProcessInvoice` to accept optional `expenseId` parameter. When provided, the method fetches existing expense and updates merchant, totalAmount, and items instead of creating duplicates. Items not confirmed by Lisa are deleted, missing items are added, and price differences are updated according to Lisa's validation. Backend types and controllers updated to match new signature. |
| 15.06.2026 | Truc Trinh | lisa-pro-03-2026 | Implement two-step OCR + Lisa validation flow for faster UI response | Modified frontend `NavBar.tsx` to call `/ocr/process-invoice` first for immediate expense creation and UI display. Lisa validation runs asynchronously in background with the created `expenseId`. SessionStorage used to track expenses pending validation. |
| 15.06.2026 | Truc Trinh | lisa-pro-03-2026 | Add Lisa validation status badges to expenses UI | Updated `ExpensesPage.tsx` to poll expense endpoints every 2s for validation status. Added three badge states: yellow pulsing "Lisa validating..." during processing, green "✓ Lisa validated" when status is "valid", and orange "Lisa needs review" for "needs_review" status. Corresponding CSS styles added for both light and dark modes. |
| 15.06.2026 | Truc Trinh | lisa-pro-03-2026 | Update lisa.yaml API specification for expenseId parameter | Added optional `expenseId` parameter to `/lisa/process-invoice` endpoint in OpenAPI spec. Updated summary to reflect update capability. Rebuilt backend to regenerate types and verified successful compilation. |
| 22.06.2026 | Rathin | Lisa Pro | Fixed lisa scan sessionStorage problem | When scanning bills with ocr, SessionStorage was used to save expense ID for lisa scan queue in the Lisa integration by Truc but it was never removed later and blocked the queue/flow when that expense was deleted before lisa scan and scan feature failed for new scans. Session management was implemented Fixed - Session storage cleanup: 1. handleDelete properly cleans up sessionStorage, polling intervals, and validating state. 2. When Lisa completes (success/error), sessionStorage is cleaned up. 3. Polling intervals are tracked in a Map and cleaned up properly |
| 29.06.2026 | Rathin| Lisa Pro | Caching structure | Scanned whole project for implementation possibilites and efficient caching. Created a plan to add caching and invalidation logic and initialised nestJS specific base boiler plate and init functions/files which can be used to implement caching in service functions for all endpoints. |

## Optionale ergänzende Hinweise

Hier können Sie bei Bedarf kurz ergänzen,

- wie Sie mit fehlerhaften KI-Antworten umgegangen sind,
- welche Vorschläge Sie bewusst verworfen haben,
- in welchen Fällen die KI nur als Sparringspartner diente.

## Eigenständigkeit und Verantwortung

Wir bestätigen, dass die KI-Nutzung in dieser Arbeit vollständig und nach bestem Wissen dokumentiert wurde.
Wir übernehmen die Verantwortung für die fachliche Richtigkeit, die Auswahl der übernommenen Inhalte und die gesamte abgegebene Arbeit.

- Datum:
- Gruppenname:

