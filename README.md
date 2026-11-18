# Money Tracker

A personal finance tracker: a Spring Boot REST API with JWT auth, plus a React + TypeScript frontend. Tracks income and expenses, shows a monthly dashboard with a spending-by-category pie chart, and keeps a paginated history.

Built as a personal project with a $0 budget: everything runs locally or on free tiers (Neon for Postgres, local Redis).

> Last updated: October 2026

---

## Current Status

**Working end to end (backend + frontend):**
- Register, login, logout (token blacklisted in Redis)
- Home dashboard: income, expenses and balance for a chosen month, plus a pie chart of spending by category
- History page: paginated list of transactions, newest first
- Add and edit transactions from the UI
- Profile endpoints on the backend (get, update, delete account)

**Placeholder only:**
- AI finance review panel on Home ("Coming soon")

**Not built yet:**
- Delete transaction button in the UI (the backend endpoint exists)
- Profile page in the UI
- CORS config (the frontend currently relies on the Vite dev proxy)
- Deployment

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA |
| Auth | JWT (jjwt 0.11.5, all three jjwt artifacts on the same version) |
| Database | PostgreSQL on Neon (local Postgres also works) |
| Token blacklist | Redis (local) |
| Frontend | React, TypeScript, Vite, React Router, Axios |
| Charts | Plain CSS (`conic-gradient`), no chart library |
| Schema | `ddl-auto=update` (Flyway planned) |
| Testing | Postman |

---

## Backend

### API Reference

All routes except `/auth/**` need `Authorization: Bearer <token>`. The transaction routes share the base path `/transaction` (singular).

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Returns a JWT |
| POST | `/auth/logout` | Blacklists the current token in Redis |
| GET | `/users/me` | Own profile |
| PUT | `/users/me` | Partial update (username, email, password) |
| DELETE | `/users/me` | Delete account and all its transactions |
| POST | `/transaction` | Add a transaction |
| GET | `/transaction?page=0&size=10` | Own transactions, paginated, newest first (max 50 per page) |
| GET | `/transaction/summary?month=YYYY-MM` | Monthly totals and expense breakdown by category (defaults to the current month) |
| PUT | `/transaction/{id}` | Partial update (ownership checked) |
| DELETE | `/transaction/{id}` | Delete (ownership checked) |

### Summary response shape

```json
{
  "totalIncome": 2500.00,
  "totalExpense": 1000.65,
  "balance": 1499.35,
  "expenseByCategory": [
    { "category": "Rent", "total": 900.00 },
    { "category": "Food", "total": 100.65 }
  ]
}
```

Transactions without a category are grouped as "Uncategorized".

### Status codes

| Code | Meaning |
|---|---|
| 200 / 204 | Success / success with no body |
| 400 | Validation failed; body is a map of field to message |
| 401 | Token expired, blacklisted or invalid; login failure |
| 403 | No token sent |
| 404 | Not found |
| 500 | Unexpected error |

### Data models

**User:** id, username (unique, 3-30 chars), email (unique), password (BCrypt hash, never serialized), createdAt.

**Transaction:** id, user (ManyToOne), amount (`BigDecimal(19,4)`), description, type (`INCOME` or `EXPENSE`), category (optional), transactionDate, createdAt.

### Package layout

```
src/main/java/shanks/personal/demo/
├── controller/   AuthController, UserController, TransactionController
├── service/      UserService, TransactionService
├── repository/   UserRepository, TransactionRepository
├── entity/       User, Transaction, TransactionType
├── security/     JwtUtil, JwtFilter, SecurityConfig, TokenBlacklistService
├── dto/          RegisterRequest, LoginRequest, AuthResponse, UpdateUserRequest,
│                 CreateTransactionRequest, UpdateTransactionRequest,
│                 TransactionResponse, CategoryTotal, SummaryResponse
└── exception/    NotFoundException, UnauthorizedException, GlobalExceptionHandler
```

### How auth works

1. `POST /auth/login` checks the password against the BCrypt hash and returns a JWT containing `userId` and `username`.
2. The client sends the token on every request.
3. `JwtFilter` checks the Redis blacklist, validates signature and expiry, and puts the verified `userId` on the request.
4. Controllers read `userId` from the request, never from the URL.
5. `POST /auth/logout` stores the token in Redis with a TTL equal to its remaining lifetime, so Redis cleans it up on its own.

---

## Frontend (`money-tracker-ui`)

### Screens

| Route | Screen |
|---|---|
| `/login`, `/register` | Auth forms, with the backend's per-field validation messages |
| `/` | Home: month picker, totals, pie chart, AI review placeholder, links to add and history |
| `/history` | Paginated transaction table with Edit links |
| `/transactions/new` | Add transaction form |
| `/transactions/:id/edit` | Edit form, prefilled from the History row |

### Layout

```
src/
├── main.tsx, App.tsx, index.css, app.css
├── types.ts, format.ts
├── api/          client.ts (Axios + token handling), auth.ts, transactions.ts, errors.ts
├── components/   AppShell.tsx, AuthLayout.tsx, Field.tsx, PieChart.tsx
└── pages/        Login, Register, Home, History, TransactionForm
```

### How it talks to the backend

- Requests go to `/api/...` on the Vite dev server, which proxies them to `http://localhost:8080` and strips `/api`. The browser sees one origin, so CORS is never triggered in development.
- The Axios client attaches the token to every request except `/auth/login` and `/auth/register`. On a `401` while holding a token, it clears the token and redirects to login.
- The token is stored in localStorage.
- Frontend request paths must match the backend controller mappings exactly, including the singular `/transaction`. A mismatch shows up as a 404 and, in the backend logs, as a `GET /error` line.

---

## Local Setup

### Backend

1. Create a Postgres database (Neon, or local Postgres with a user that owns the `public` schema).
2. Start Redis: `sudo systemctl start redis-server`, then check `redis-cli ping` returns `PONG`.
3. Set environment variables (IntelliJ Run Configuration, one row per variable):

   | Variable | Value |
   |---|---|
   | `DB_URL` | JDBC URL. For Neon, the credentials and `sslmode=require` are inside the URL. |
   | `DB_USERNAME` / `DB_PASSWORD` | Used with a local Postgres URL; ignored when the URL already carries credentials |
   | `JWT_SECRET` | Long random string, e.g. `openssl rand -base64 32` |

4. Run the app on port 8080. Before starting, make sure nothing else holds the port: `sudo lsof -i :8080`.

### Frontend

```bash
npm install
npm run dev     # http://localhost:5173
```

To point the dev proxy at a different backend, change `target` in `vite.config.ts` and restart Vite (it only reads the file at startup).

---

## Known Issues and Next Steps

### Backend
- [ ] Duplicate username or email returns a 500; should be a `409` (handle `DataIntegrityViolationException`)
- [ ] Ownership failures return `401`; should be `403` (the frontend treats any 401 as an expired session and logs out)
- [ ] `JwtFilter` rejects expired tokens on `/auth/**` too; override `shouldNotFilter` to skip those paths
- [ ] Allow `/error` in `SecurityConfig` so real error statuses aren't masked as 403
- [ ] A category can't be cleared once set (partial update treats a missing field as "unchanged")
- [ ] Switch `ddl-auto=update` to Flyway migrations
- [ ] Replace `System.out.println` with SLF4J; remove `DEBUG`/`TRACE` logging lines from `application.properties`
- [ ] Rate limiting on `/auth/login` and `/auth/register`
- [ ] Refresh tokens (1 hour expiry)
- [ ] Unit and integration tests
- [ ] Add CORS config before deploying the frontend anywhere

### Frontend
- [ ] Delete button on History rows
- [ ] Profile page (edit details, change password, delete account)
- [ ] The edit page needs the row passed from History; opening it directly redirects to History
- [ ] Token in localStorage is fine for now; move to an HttpOnly cookie plus refresh tokens if this goes public

### Features
- [ ] AI finance review (placeholder panel exists on Home)
- [ ] Income breakdown or trend charts
- [ ] Accounts (Cash, Bank, Card) with running balances
- [ ] Recurring transactions, per-category budget limits

---

## Design Decisions Worth Remembering

- Money is `BigDecimal` / `NUMERIC(19,4)`, never `float` or `double`.
- JPA relationships use the entity (`User user`), not a raw `Long userId`; the DB column is still just a number.
- `userId` always comes from the verified token, so URL tampering can't reach another user's data.
- Responses use DTOs (`TransactionResponse`) so entities and the hashed password never leak.
- Summary totals are computed by the database, because paginated data can't give correct totals.
- The pie chart is plain CSS so there's no chart dependency to maintain.

---

## Session Context (for continuing in a new chat)

Built so far, in order: Spring Boot setup and layering; User and Transaction entities; JWT auth with Spring Security; Redis token blacklist and logout; `@Valid` validation and a global exception handler; `TransactionResponse` DTO; pagination; Neon database; React + Vite + TypeScript frontend with login, register, Home dashboard (pie chart), History, and add/edit transaction form; monthly summary endpoint.

The most recent debugging issue was a frontend/backend path mismatch (`/transactions` vs `/transaction`). When something returns 404 through the frontend, compare the path in `api/transactions.ts` with the controller mappings first.

Next logical steps: delete button in the UI, profile page, the `409` and `403` status fixes, Flyway, then the AI review feature.
