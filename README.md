# Lydian

Lydian is an independently developed music-practice application for organizing a music library, setlists, practice sessions and progress insights.

This repository contains a standalone source snapshot of the Angular frontend and NestJS API. It is an early public release; no external adoption or production reliability claim is implied.

## Repository layout

- `frontend/`: Angular application, UI components, authentication flows and practice features.
- `backend/`: NestJS API, Supabase integration, SQL migrations and tests.
- `PUBLICATION.md`: source provenance, validation and publication limitations.

## Requirements

- Node.js 24 LTS, at least 24.14.0 and below 25.
- npm.
- A Supabase environment configured with your own credentials for live API/database use.

## Local development

Read [frontend/README.md](frontend/README.md) and [backend/README.md](backend/README.md) for service configuration. Keep local frontend development on HTTPS, as required by the cookie-based authentication flow.

```sh
cd backend
npm ci
cp .env.example .env
# Configure your own local environment before starting the API.
npm run start:dev
```

In a separate terminal:

```sh
cd frontend
npm ci
npm start
```

Never commit `.env`, service-role keys, credentials, database exports or authenticated browser state. Deployment URLs included in the source are references to the original project; configure your own services instead of relying on those environments.

## Verification

The frontend build currently has known static/SSR routing and prerender limitations; see [PUBLICATION.md](PUBLICATION.md). The API build and unit tests passed during preparation.


```sh
cd backend
npm run build
npm test -- --runInBand
```

```sh
cd frontend
npm run build
```

Database and end-to-end tests require separate infrastructure and configuration. See the backend documentation before running database commands.

## Project status

This is a newly published codebase with existing local development history. Public downloads, dependent packages, community contributors and ecosystem impact have not been established. Planned or mocked integrations should not be treated as validated production features.

## License

The project source code is available under the [MIT License](LICENSE), authorized by the copyright holder on 2026-11-17. Dependency and third-party asset licenses remain applicable.
