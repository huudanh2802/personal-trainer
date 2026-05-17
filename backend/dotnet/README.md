# Personal Trainer API (.NET)

ASP.NET Core API with JWT authentication, PostgreSQL database, and admin endpoints for exercises and weekly schedules.

## Run locally

### Docker (recommended)

From the repo root:

```bash
./scripts/dev.sh
# or
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:5050
- Admin: `admin@personal-trainer.local` / `ChangeMe123!`

Stop: `npm run docker:down` · Logs: `npm run docker:logs`

Optional meal API: `npm run docker:meal` (port 8787)

PostgreSQL data persists in the Docker volume `postgres-data`.

### Without Docker

Start PostgreSQL (example with Docker only the database):

```bash
docker run -d --name pt-postgres -p 5432:5432 \
  -e POSTGRES_USER=personal_trainer \
  -e POSTGRES_PASSWORD=personal_trainer \
  -e POSTGRES_DB=personal_trainer \
  postgres:16-alpine
```

Then run the API:

```bash
cd backend/dotnet/PersonalTrainer.Api
dotnet run
```

API: `http://localhost:5050` · Postgres: `localhost:5432` (see `appsettings.json`)

Default admin (change in `appsettings.json` or user secrets):

- Email: `admin@personal-trainer.local`
- Password: `ChangeMe123!`

## Web app

Copy `apps/web/.env.example` to `apps/web/.env`:

```
VITE_API_URL=http://localhost:5050
```

Then:

```bash
npm run api    # terminal 1
npm run web    # terminal 2
```

Sign in at **Admin login** → manage exercises and weekly plan.

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | JWT |
| GET | `/api/exercises` | — |
| GET | `/api/schedule/weekly` | — |
| GET/POST/PUT/DELETE | `/api/admin/exercises` | Admin |
| PUT | `/api/admin/schedule/{dayOfWeek}` | Admin |

`dayOfWeek`: 0 = Sunday … 6 = Saturday.
