# AWS Deployment Guide

This guide deploys DocuMind AI to AWS with the following target architecture:

- Frontend: nginx on EC2 from the Dockerized Vite build
- Optional frontend alternative: S3 static website hosting
- Backend: Spring Boot Docker container on EC2
- Storage: Amazon S3 for uploaded PDFs
- Database: Amazon RDS PostgreSQL with `pgvector`
- Logs: stdout/stderr from containers, ready for CloudWatch ingestion
- IAM: least-privilege EC2 role for S3 access

## 1. Create an S3 bucket

1. Create a bucket in the same AWS region as the EC2 instance.
2. Keep block public access enabled.
3. Record the bucket name for `AWS_S3_BUCKET`.
4. If this is production, enable versioning and server-side encryption.

## 2. Create an RDS PostgreSQL instance

1. Create an Amazon RDS PostgreSQL instance.
2. Use a PostgreSQL version compatible with `pgvector`.
3. Place it in private subnets if possible.
4. Record:
   - endpoint hostname
   - database name
   - username
   - password
5. Create the application database if you did not do so during RDS creation.

Example JDBC URL:

```text
jdbc:postgresql://YOUR_RDS_ENDPOINT:5432/documind
```

## 3. Enable the `pgvector` extension

Connect to RDS with `psql` or another PostgreSQL client and run:

```sql
\i infra/aws/rds-init.sql
```

Or copy and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 4. Create an EC2 instance

Recommended baseline:

- Amazon Linux 2023 or Ubuntu 22.04 LTS
- t3.small or larger for a smoother demo experience
- 20 GB+ gp3 EBS volume

The repository can be cloned directly onto the EC2 instance or copied from CI/CD artifacts.

## 5. Attach an IAM role to EC2

1. Create an IAM policy from [sample-iam-policy-s3.json](./sample-iam-policy-s3.json).
2. Replace `YOUR_BUCKET_NAME` with the real bucket ARN.
3. Create an IAM role for EC2.
4. Attach the S3 policy to that role.
5. Attach the IAM role to the EC2 instance.

This setup avoids hardcoding AWS access keys in application configuration.

## 6. Configure security groups

### EC2 security group

Allow:

- `22/tcp` from trusted administrator IPs only
- `80/tcp` from users or the internet if the frontend is public

Optional:

- `443/tcp` if you terminate TLS directly on the instance
- Avoid exposing `8080/tcp` publicly unless required for troubleshooting

### RDS security group

Allow:

- `5432/tcp` only from the EC2 security group

Do not open RDS to the public internet.

## 7. Prepare production environment variables

Create a `.env` file at the repository root on EC2.

Example:

```env
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=aws
DB_URL=jdbc:postgresql://YOUR_RDS_ENDPOINT:5432/documind
DB_USERNAME=documind
DB_PASSWORD=change-this-password
JWT_SECRET=change-this-secret
SPRING_AI_OPENAI_API_KEY=your-openai-key
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
APP_AI_CHAT_ENABLED=true
APP_AI_EMBEDDINGS_ENABLED=true
STORAGE_PROVIDER=s3
AWS_REGION=us-west-2
AWS_S3_BUCKET=your-bucket-name
LOCAL_UPLOAD_DIR=uploads
VITE_API_BASE_URL=http://YOUR_EC2_PUBLIC_IP:8080
```

Notes:

- Set `STORAGE_PROVIDER=s3` for AWS deployment.
- The application uses the EC2 IAM role through the default AWS credential provider chain.
- If you front the frontend with nginx only, you may want `VITE_API_BASE_URL` to point to a reverse-proxied backend path instead.

## 8. Run Docker Compose on EC2

Use the bootstrap script:

```bash
chmod +x infra/aws/ec2-setup.sh
APP_DIR=/opt/documind APP_USER=ec2-user ./infra/aws/ec2-setup.sh
```

Or run the compose file directly:

```bash
docker compose --env-file .env -f infra/aws/production-docker-compose.yml up -d --build
```

## 9. Test the backend health endpoint

From the EC2 instance:

```bash
curl http://localhost:8080/actuator/health
```

Expected: HTTP 200 with health JSON.

## 10. Test the upload endpoint

1. Register a user with the auth API.
2. Log in and capture the JWT.
3. Upload a PDF:

```bash
curl -X POST "http://localhost:8080/api/documents/upload" \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "file=@sample.pdf"
```

Expected:

- document metadata response
- file stored in S3
- document chunks written to RDS

## 11. Test the chat endpoint

After the uploaded document reaches `READY`:

```bash
curl -X POST "http://localhost:8080/api/chat/ask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "documentId": "YOUR_DOCUMENT_ID",
    "question": "What are the main points of this PDF?"
  }'
```

Expected:

- answer text
- source snippets

## 12. Frontend hosting options

### Option A: Frontend on EC2 with nginx

This is the default in [production-docker-compose.yml](./production-docker-compose.yml).

Pros:

- simplest full-stack EC2 deployment
- one host to manage

Cons:

- EC2 must stay online for both frontend and backend

### Option B: Frontend on S3 static hosting or CloudFront

1. Build the frontend:

```bash
cd frontend
npm install
npm run build
```

2. Upload `frontend/dist` to S3.
3. Optionally place CloudFront in front of the S3 bucket.
4. Set `VITE_API_BASE_URL` to the backend public URL before building.

Pros:

- cheaper and simpler for static hosting
- separates frontend delivery from the EC2 host

Cons:

- requires a separate static-hosting workflow

## 13. CloudWatch-ready logging

The current containers log to stdout/stderr.

That is sufficient for:

- CloudWatch Agent collection from the host
- Docker log shipping
- future migration to the Docker `awslogs` driver

If you need central log aggregation later, add one of:

- CloudWatch Agent on EC2
- Docker `awslogs` logging driver
- Fluent Bit / OpenTelemetry collector

## Cost warning

- Stop EC2 and RDS when you are not using them.
- Set AWS billing alerts before public testing.
- Avoid EKS for this project. It is not cost-effective or operationally justified here.
- Prefer a single EC2 instance plus RDS for a recruiter-demo deployment.
