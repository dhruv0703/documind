# DocuMind RAG API

AWS-powered AI document Q&A system built with Java 21, Spring Boot 3.x, Spring AI, PostgreSQL pgvector, React, and Amazon S3.

## Architecture

```text
User
  -> React Frontend
  -> Spring Boot API on EC2
  -> S3 for PDFs
  -> PDFBox extraction
  -> Spring AI embeddings
  -> RDS PostgreSQL pgvector
  -> Semantic Search
  -> OpenAI / AWS Bedrock-ready answer generation
```

Current implementation uses Spring AI with OpenAI models for embeddings and chat orchestration. The service boundaries are intentionally structured so AWS Bedrock can be introduced without rewriting the application architecture.

## Features

- JWT authentication with protected document and chat routes
- PDF upload pipeline with per-user document ownership enforcement
- Local storage for development and Amazon S3 storage for deployment
- PDF text extraction using Apache PDFBox
- Paragraph-aware text chunking with overlap for RAG retrieval quality
- Embedding generation using Spring AI and `text-embedding-3-small`
- PostgreSQL `pgvector` semantic search with cosine similarity
- RAG answer generation with source-grounded snippets
- Polished React dashboard with landing page, auth, documents, and chat views
- Docker Compose for local full-stack development
- AWS deployment documentation and EC2/RDS/S3 deployment scripts
- GitHub Actions CI for backend, frontend, Docker build, and manual EC2 deploy

## Tech Stack

| Layer | Technologies | Purpose |
| --- | --- | --- |
| Backend | Java 21, Spring Boot 3.5, Maven | Core API, dependency management, application runtime |
| Security | Spring Security, JWT, BCrypt | Authentication, authorization, password hashing |
| AI / RAG | Spring AI, OpenAI embeddings/chat | Embeddings, retrieval orchestration, answer generation |
| Database | PostgreSQL, pgvector, Spring Data JPA, JdbcTemplate | Document metadata, chunk storage, vector search |
| File Processing | Apache PDFBox | PDF parsing and text extraction |
| Storage | Amazon S3, local filesystem fallback | Uploaded PDF storage |
| Frontend | React, Vite, TypeScript, Tailwind CSS, Axios, React Router | Dashboard UI and API integration |
| Visualization | Recharts, Lucide React, Framer Motion | Metrics, icons, lightweight UI animation |
| DevOps | Docker, Docker Compose, nginx, GitHub Actions | Local orchestration, containerization, CI |
| AWS Infra | EC2, RDS PostgreSQL, S3, IAM, CloudWatch-ready logging | Production deployment target |

## Local Setup

### Prerequisites

- Java 21
- Node.js 20+
- npm 10+
- Docker Desktop or Docker Engine with Compose

### Environment Variables

Root `.env` example:

```env
POSTGRES_DB=documind
POSTGRES_USER=documind
POSTGRES_PASSWORD=documind
JWT_SECRET=change-this-secret
SPRING_AI_OPENAI_API_KEY=your-openai-key
STORAGE_PROVIDER=local
AWS_REGION=us-west-2
AWS_S3_BUCKET=your-bucket-name
```

Backend `.env` example:

```env
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=local
DB_URL=jdbc:postgresql://localhost:5432/documind
DB_USERNAME=documind
DB_PASSWORD=documind
SPRING_AI_OPENAI_API_KEY=replace-me
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
APP_AI_CHAT_ENABLED=true
APP_AI_EMBEDDINGS_ENABLED=true
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRATION_MS=86400000
STORAGE_PROVIDER=local
LOCAL_UPLOAD_DIR=uploads
AWS_REGION=us-west-2
AWS_S3_BUCKET=your-bucket-name
RAG_CHUNK_SIZE=1200
RAG_CHUNK_OVERLAP=200
RAG_EMBEDDING_DIMENSION=1536
```

Frontend `.env` example:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Start PostgreSQL + pgvector with Docker Compose

From the repository root:

```powershell
docker compose up -d
```

To build and run the full containerized stack:

```powershell
docker compose up --build
```

Local services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

### Run the Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

Unix-style equivalent:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Useful backend endpoints:

- API base: `http://localhost:8080`
- Health: `http://localhost:8080/api/health`
- Actuator health: `http://localhost:8080/actuator/health`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Run the Frontend

```powershell
cd frontend
Copy-Item .env.example .env -Force
npm install
npm run dev
```

Additional frontend scripts:

```powershell
npm run build
npm run lint
npm run typecheck
npm run preview
```

### Testing

Backend tests:

```powershell
cd backend
.\mvnw.cmd test
```

Frontend build verification:

```powershell
cd frontend
npm run build
```

## AWS Deployment

Production deployment support lives under `infra/aws`.

### Target AWS Components

- Amazon S3 for uploaded PDF storage
- Amazon RDS PostgreSQL with `pgvector` for metadata and vector search
- Amazon EC2 for the Spring Boot API and nginx-served frontend containers
- IAM role with least-privilege S3 access
- CloudWatch-ready application logs from the containerized backend

### Included AWS Assets

- `infra/aws/ec2-setup.sh`
- `infra/aws/production-docker-compose.yml`
- `infra/aws/rds-init.sql`
- `infra/aws/sample-iam-policy-s3.json`
- `infra/aws/aws-deployment-guide.md`

### Deployment Summary

1. Create an S3 bucket for uploaded PDFs.
2. Create an RDS PostgreSQL instance and run `CREATE EXTENSION IF NOT EXISTS vector;`.
3. Launch an EC2 instance and attach an IAM role with S3 bucket access.
4. Configure security groups for HTTP, HTTPS, SSH, and database connectivity.
5. Set application environment variables for JWT, database, OpenAI, AWS region, and S3 bucket.
6. Run the production Docker Compose file on EC2.
7. Validate `/actuator/health`, document upload, and chat endpoints.

### Cost Warning

- Stop EC2 and RDS when you are not actively using them.
- Set AWS billing alerts before testing the full stack in the cloud.
- Avoid EKS for this project unless you actually need orchestration complexity.

## API Examples

### Register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dhruv Shah",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Example response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Dhruv Shah",
    "email": "test@example.com"
  }
}
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Upload Document

```bash
curl -X POST http://localhost:8080/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sample.pdf"
```

Example response:

```json
{
  "documentId": "22222222-2222-2222-2222-222222222222",
  "fileName": "sample.pdf",
  "status": "READY",
  "chunkCount": 24
}
```

### Ask a Question

```bash
curl -X POST http://localhost:8080/api/chat/ask \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "22222222-2222-2222-2222-222222222222",
    "question": "What are the main points of this PDF?"
  }'
```

Example response:

```json
{
  "answer": "The document explains the upload pipeline, chunk indexing flow, and retrieval-based answering process.",
  "sources": [
    {
      "chunkIndex": 3,
      "similarity": 0.84,
      "snippet": "This section explains how uploaded PDFs are parsed into chunks for retrieval."
    }
  ]
}
```

## Screenshots

Add project screenshots here for portfolio and recruiter review.

- `[Placeholder]` Landing page
- `[Placeholder]` Dashboard
- `[Placeholder]` Upload screen
- `[Placeholder]` Document list
- `[Placeholder]` Q&A answer view

Example structure if you want to add assets later:

```text
docs/screenshots/
  landing-page.png
  dashboard.png
  upload-screen.png
  document-list.png
  qa-answer.png
```

## GitHub Actions CI

The repository includes:

- `.github/workflows/backend-ci.yml`
- `.github/workflows/frontend-ci.yml`
- `.github/workflows/docker-build.yml`
- `.github/workflows/deploy-ec2.yml`

### Required GitHub Secrets

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

### Optional Registry Secrets

- `REGISTRY_HOST`
- `REGISTRY_USERNAME`
- `REGISTRY_PASSWORD`

## Render Deployment

The repository includes a `render.yaml` blueprint for a recruiter-demo deployment on Render with:

- frontend as a static site
- backend as a Docker web service
- Render Postgres with `pgvector`
- local upload storage on a persistent disk

### Recommended Render Shape

- `documind-frontend`: static site
- `documind-backend`: free web service
- `documind-postgres`: free Render Postgres instance

Why this setup is fully free:

- frontend uses Render static hosting
- backend uses a free Render web service
- database uses free Render Postgres

### Demo Mode Defaults

The Render blueprint is configured for a demo-oriented deployment:

- `SPRING_PROFILES_ACTIVE=local`
- `APP_AI_CHAT_ENABLED=false`
- `APP_AI_EMBEDDINGS_ENABLED=false`
- `STORAGE_PROVIDER=local`

In this mode:

- uploads still work
- documents are chunked and searchable
- retrieval falls back to keyword matching instead of OpenAI embeddings
- answers return a mock summary built from retrieved chunks
- uploaded PDF files are stored only temporarily on the backend filesystem

### Render Deploy Steps

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Review the generated resources from `render.yaml`.
4. Keep the backend and database on the free plans if you want a zero-cost demo.
5. After the first deploy, open the backend database and ensure the `vector` extension exists:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

6. Open the frontend URL and register a user.
7. Upload a sample PDF and test the chat flow.

### Render Notes

- The blueprint sets frontend `VITE_API_BASE_URL` to `https://documind-backend.onrender.com`.
- If Render assigns a different backend subdomain, update `VITE_API_BASE_URL` in the frontend service and redeploy it.
- The backend CORS setting allows `https://*.onrender.com` for demo hosting.
- Free Render web services spin down after 15 minutes of inactivity, so the first request after idle will be slow.
- Free Render web services use an ephemeral filesystem, so uploaded PDF files can disappear after restart or spin-down.
- Document metadata and indexed chunks remain in Render Postgres, so the chat demo can still work after upload processing completes.
- Free Render Postgres expires after 30 days, so this setup is for demos, not long-term storage.

## Resume Bullets for Dhruv Shah

- Built a production-style Retrieval-Augmented Generation platform using Java 21, Spring Boot, Spring AI, PostgreSQL `pgvector`, React, and Amazon S3 to support secure question-answering over uploaded PDF documents.
- Designed and implemented an end-to-end document intelligence pipeline covering JWT authentication, PDF ingestion, chunking, embedding generation, semantic retrieval, and source-grounded AI responses with Dockerized local development and AWS deployment support.
- Engineered a full-stack developer workflow with GitHub Actions CI, Docker Compose, EC2/RDS/S3 deployment assets, and a polished recruiter-demo frontend dashboard to present applied backend, cloud, and AI engineering skills in one system.

## Future Improvements

- Add AWS Bedrock support through Spring AI model abstraction
- Store secrets in AWS Secrets Manager instead of plain environment variables
- Deploy containers to Amazon ECS for more managed production operations
- Add CloudWatch dashboards and alerting for API, latency, and ingestion failures
- Introduce semantic caching for repeated or near-duplicate questions
- Support multi-document chat and cross-document retrieval
