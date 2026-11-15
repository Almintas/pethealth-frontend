# PetHealth — Owner Portal

The web app pet owners use in PetHealth, a pet health record system (like
e-sveikata.lt, but for pets). Built mobile-first, since most owners use phones.

Owners can:

- register, or activate an account a clinic created for them (`/activate-account`);
- keep pet profiles with photos, reminders and their own appointments;
- see the medical records, vaccinations and medications their clinic records;
- give a clinic access with a one-time code and revoke it (pet page → *Clinic access*);
- choose email reminders, language (LT/EN) and light/dark theme.

React 19, TypeScript, Vite, Apollo Client 4, react-i18next, React Router 7.
It talks to the owner API (`pethealth-backend`) over GraphQL; pet photos use
the API's REST endpoints.

## Environment variables

Copy `.env.example` to `.env`.

| Variable | Description |
|----------|-------------|
| `VITE_GRAPHQL_URL` | Owner API GraphQL endpoint, e.g. `http://localhost:3000/graphql`. Required. |
| `VITE_API_BASE_URL` | Optional REST origin for pet photos; defaults to `VITE_GRAPHQL_URL` without `/graphql`. |

`VITE_*` values are built into the bundle; never put secrets in them.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server on http://localhost:5173 (fixed port). |
| `npm run build` | Type-check and build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint (TypeScript + React hooks rules). |
| `npm test` | Vitest unit tests, including translation checks. |

CI (`.github/workflows/frontend-ci.yml`) lints, tests and builds on every push
and pull request to `dev`. `vercel.json` rewrites all routes to `index.html`
for client-side routing.

## Design system and translations

- `src/styles/tokens.css` is **shared and kept identical** between the owner
  portal and the clinic app: colours (WCAG AA contrast), spacing, radii and the
  button system. The clinic app sets `data-density="compact"` on `<html>` for
  slightly denser controls; the owner portal uses the default, calmer density.
  Change tokens in both repositories together.
- Languages: English and Lithuanian (`src/i18n/locales/en.ts`, `lt.ts`).
  `npm test` fails if a key is missing in either language, placeholders differ,
  or a Lithuanian plural form (`_one`, `_few`, `_many`, `_other`) is missing.
  Use i18next plurals (`t('key', { count })`) for counts.

## Run the whole system locally

PetHealth is four repositories that run side by side:

| Repo | What it is | Local URL |
|------|------------|-----------|
| [`pethealth-backend`](https://github.com/Almintas/pethealth-backend) | Owner API (NestJS, GraphQL, MongoDB) | http://localhost:3000/graphql |
| [`pethealth-vet-backend`](https://github.com/Almintas/pethealth-vet-backend) | Clinic API, own database | http://localhost:3001/graphql |
| [`pethealth-frontend`](https://github.com/Almintas/pethealth-frontend) | Owner portal (React, Vite) | http://localhost:5173 |
| [`pethealth-vet-frontend`](https://github.com/Almintas/pethealth-vet-frontend) | Clinic app (React, Vite) | http://localhost:5174 |

The owner API owns all pet health data. The clinic API keeps clinics, vets and
access grants in its own database and reads/writes owner data through the owner
API's internal GraphQL, authenticated with the `x-pethealth-service-secret`
header (`OWNER_SERVICE_SECRET`, same value in both backends).

### 1. Prerequisites

- Node.js 22 or newer and npm.
- MongoDB 7 on `localhost:27017`. With Docker:

  ```bash
  docker run -d --name pethealth-mongo -p 27017:27017 mongo:7
  ```

### 2. Install and configure

Clone the four repositories next to each other, then in **each** one:

```bash
cp .env.example .env
npm install
```

The example files already point the services at each other and share the same
development `OWNER_SERVICE_SECRET`, so no edits are needed for local use.

### 3. Start everything (four terminals, in this order)

```bash
# pethealth-backend
npm run start:dev        # owner API on :3000

# pethealth-vet-backend
npm run start:dev        # clinic API on :3001

# pethealth-frontend
npm run dev              # owner portal on :5173

# pethealth-vet-frontend
npm run dev              # clinic app on :5174
```

The frontends use fixed ports (`strictPort`); if a port is taken, Vite stops
instead of silently moving, because CORS and email links expect these ports.

### 4. Create and approve a veterinarian

1. Open http://localhost:5174/register and sign up with a licence number.
   The app shows the *pending approval* screen.
2. In `pethealth-vet-backend`, list pending accounts and approve one after
   checking the licence number against the official register:

   ```bash
   npm run vet:approve -- --list
   npm run vet:approve -- vet@clinic.lt            # approve
   npm run vet:approve -- vet@clinic.lt --reject   # reject
   ```

3. Back in the clinic app, press **Check again** (or sign in again).

Or approve in the app: make one account a PetHealth platform admin, then use
its **Vet approvals** page (`/admin/veterinarians`). Platform admins have no
clinic or patient access.

```bash
npm run admin:grant -- admin@pethealth.lt   # in pethealth-vet-backend; register the account first
```

### 5. Create a clinic

An approved vet without a clinic sees **Create your clinic** on the dashboard
and on *My clinic*. For a quick demo setup you can instead run, in
`pethealth-vet-backend`:

```bash
node scripts/seed-demo-clinic.mjs
```

It takes the **first registered** veterinarian profile, approves that account,
creates *PetHealth Vet Demo Clinic* and an active membership. It is safe to run
again. Register your vet before running it.

Both scripts use `MONGODB_URI` from the shell environment (they do not read
`.env`) and default to `mongodb://localhost:27017/pethealth_vet_dev`. Prefix the
command if your database differs, e.g.
`MONGODB_URI=mongodb://… node scripts/seed-demo-clinic.mjs`.

### 6. Try the main flows

- **Clinic registers a new owner and pet** (clinic app → Patients → *Add patient*).
  The owner gets an activation email. Without `RESEND_API_KEY`, the owner API
  prints the activation link in its console instead (development only); open
  it to set a password at `/activate-account`.
- **Activity log**: every view (at most once per 30 minutes per person) and
  every change a clinic makes is recorded. The owner sees it on the pet page
  under *Activity log*.
- **Existing owner shares a pet**: in the owner portal open a pet →
  *Clinic access* → *Create code for clinic*. In the clinic app use
  *Add by owner code*. Codes are single-use and valid for 15 minutes; the
  owner can revoke access at any time.
- Records, vaccinations, medications and appointments added by the clinic
  appear in the owner portal.
