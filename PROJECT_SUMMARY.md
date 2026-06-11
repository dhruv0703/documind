# Project Summary

## What Was Built

DocuMind RAG API is a full-stack AI document question-answering system built as a portfolio-grade engineering project. The repository includes:

- A Java 21 Spring Boot 3.x backend for authentication, document ingestion, vector retrieval, and RAG responses
- A React + Vite + TypeScript frontend with a polished AI dashboard and landing page
- PostgreSQL with `pgvector` for semantic search
- Local filesystem storage for development and Amazon S3 support for deployment
- Docker and Docker Compose for local orchestration
- AWS deployment assets for EC2, RDS PostgreSQL, S3, and IAM
- GitHub Actions workflows for backend CI, frontend CI, Docker build, and manual EC2 deployment

## Architecture

```text
User
  -> React Frontend
  -> Spring Boot API
  -> JWT Authentication
  -> PDF Upload
  -> S3 or Local Storage
  -> PDFBox Text Extraction
  -> Chunking + Embeddings
  -> PostgreSQL pgvector Semantic Search
  -> RAG Answer Generation with Source Snippets
```

### Backend Responsibilities

- `AuthController` and JWT security for registration, login, and protected API access
- `DocumentController` for upload, list, get, and delete document operations
- `ChatController` for semantic search and grounded Q&A
- `DocumentIngestionService` for extraction, chunking, and embedding persistence
- `VectorSearchService` and `DocumentChunkSearchRepository` for cosine similarity search with `pgvector`
- Provider-based storage abstraction for local filesystem and Amazon S3

### Frontend Responsibilities

- Public landing page at `/`
- Protected dashboard experience for uploads, documents, activity, and Q&A
- JWT token handling in `localStorage`
- Axios API client with bearer token injection
- Graceful empty-state behavior when backend data is unavailable

## AWS Services Used

- **Amazon EC2**: host Spring Boot and nginx-served frontend containers
- **Amazon S3**: store uploaded PDF files
- **Amazon RDS PostgreSQL**: persist users, documents, chunks, and vector metadata
- **IAM**: grant least-privilege S3 access to the EC2 instance role
- **CloudWatch-ready logs**: backend logs are structured for container log forwarding

## Local Run Steps

### 1. Start Docker services

From the repository root:

```powershell
docker compose up --build
```

Or start only PostgreSQL first:

```powershell
docker compose up -d
```

### 2. Run backend directly

```powershell
cd backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

### 3. Run frontend directly

```powershell
cd frontend
Copy-Item .env.example .env -Force
npm install
npm run dev
```

### 4. Verify key endpoints

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- Health: `http://localhost:8080/actuator/health`

## Resume Bullets

- Built a production-style Retrieval-Augmented Generation platform using Java 21, Spring Boot, Spring AI, PostgreSQL `pgvector`, React, and Amazon S3 to support secure question-answering over uploaded PDF documents.
- Designed and implemented an end-to-end document intelligence pipeline covering JWT authentication, PDF ingestion, chunking, embedding generation, semantic retrieval, and source-grounded AI responses with Dockerized local development and AWS deployment support.
- Engineered a full-stack developer workflow with GitHub Actions CI, Docker Compose, EC2/RDS/S3 deployment assets, and a polished recruiter-demo frontend dashboard to present applied backend, cloud, and AI engineering skills in one system.

## Demo Script for Interviews

Use this sequence during a technical interview or recruiter demo:

1. Start on the landing page and explain the product in one sentence: secure AI Q&A over uploaded PDFs.
2. Open the dashboard and show the sidebar, metrics, recent documents, and Q&A panel.
3. Register or log in and explain JWT auth plus protected API routes.
4. Upload a sample PDF and describe the ingestion flow:
   - upload
   - storage
   - PDF extraction
   - chunking
   - embeddings
   - `pgvector` search indexing
5. Open the documents view and show document status, chunk counts, and ownership-scoped access.
6. Ask a question about the uploaded document and explain:
   - question embedding
   - top-k chunk retrieval
   - source-grounded answer generation
7. Open Swagger UI and show the backend API surface for auth, documents, and chat.
8. Close by describing the AWS deployment path:
   - EC2 for containers
   - S3 for PDFs
   - RDS PostgreSQL with `pgvector`
   - IAM for least-privilege access
   - GitHub Actions for CI and deployment automation

## Production Readiness Notes

- Backend tests cover auth, chunking, PDF extraction, chat service behavior, Swagger access, auth endpoints, protected document routes, authenticated upload, and authenticated ask flow.
- Frontend build and lint pass successfully.
- Docker Compose configuration validates successfully.
- Full Docker runtime verification requires a running local Docker daemon.
- No committed secrets were found in the repository configuration or source files during the final cleanup pass.
