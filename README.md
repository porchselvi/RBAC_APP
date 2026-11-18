# RBAC App

React/Vite frontend with a Java 17 Spring Boot REST API. The backend uses Gradle, Spring Security, BCrypt password hashing, signed JWT bearer tokens, Spring Data JPA, and a local H2 file database.

## Run locally

### Backend

```bash
cd backend
gradle bootRun
```

The API listens on `http://localhost:8080`. On first startup it creates an admin account and the default roles. Local-only default credentials are `admin@company.com` / `ChangeMe123!`. Override `ADMIN_EMAIL` and `ADMIN_PASSWORD` before starting the service; change them before using this outside local development.

Set a strong signing secret (at least 32 bytes) and optionally configure the port, database URL, and frontend origin:

```bash
JWT_SECRET='use-a-long-random-secret-at-least-32-bytes' \
ADMIN_EMAIL='admin@example.com' ADMIN_PASSWORD='change-this-password' \
FRONTEND_ORIGIN='http://localhost:5173' gradle bootRun
```

The H2 database is stored under `backend/data/` and keeps users/roles between restarts. Configure `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` to use another database; the current datasource driver is H2, so change the driver/dependency for other database engines.

### Frontend

From the repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. To override the API URL, set `VITE_API_BASE_URL` (for example `http://localhost:8080/api`) before running Vite.

## API

All paths are rooted at `http://localhost:8080/api`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/login` | Public | Verify email/password and issue JWT |
| POST | `/auth/register` | Public | Register a regular `USER` and issue JWT |
| GET | `/rbac` | Admin | Load dashboard users and roles |
| GET, POST | `/users` | Admin | List users / create a user with a role |
| GET, POST | `/roles` | Admin | List roles / create a role and permissions |

Send protected requests with `Authorization: Bearer <token>`. New registrations always receive the `USER` role; the public registration endpoint cannot assign elevated roles. Only the admin user can create roles and assign roles to accounts.

Example login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@company.com","password":"ChangeMe123!"}'
```
