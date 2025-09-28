Manual Data Ingestion

Overview
- Enables manual upload of CSV, PDF, JSON, or TXT files when direct integrations (Dentrix, DentalIntel, ADP, Eaglesoft) are unavailable.
- Backend creates an ingestion job, stores the raw file, parses it into staging records, and exposes endpoints to view progress.

Backend Endpoints (under `/api/integrations`)
- GET `/ingestion/supported`: list accepted file types and limits
- POST `/ingestion/upload` (multipart): fields `practiceId`, `sourceSystem`, optional `dataset`, and `file`
- POST `/ingestion/jobs/:id/process`: parse the uploaded file and create staging records
- GET `/ingestion/jobs`: list jobs for current user’s accessible practices (optional `practiceId`)
- GET `/ingestion/jobs/:id`: job details
- GET `/ingestion/jobs/:id/records`: paginated staging records (default 50)

Data Model (Drizzle ORM)
- `ingestion_jobs`: tracks uploaded file, type, status, counts, and errors
- `ingestion_records`: staging rows extracted from the file (JSON)

Install Dependencies
- cd `backend` then install:
  - npm i multer pdf-parse csv-parse
  - npm i -D @types/multer

Database Migrations
- Update Drizzle schema config already points to `src/database/schema.ts` and `src/database/ingestion.ts`.
- Run: `npm run db:generate` then `npm run db:push` (in `backend`).

Configuration
- Upload directory env var (optional): `INGESTION_UPLOAD_DIR=/path/to/uploads`
  - Defaults to `<repo>/backend/uploads`

Frontend
- New page `Integrations → Manual Ingestion` at `/integrations/ingestion`.
- Upload a file, then click Process to parse and stage records.

Notes
- CSV is parsed using header row (columns: true); PDF text is extracted as a single staging record.
- Future: add mapping UI to push staged data into domain tables (patients, appointments, payroll) safely.

