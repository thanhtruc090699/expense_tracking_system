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
|  |  |  |  |  |
|  |  |  |  |  |

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

