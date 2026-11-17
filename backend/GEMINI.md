# Lydian API - Project Instructions

## 🏛️ Architecture
This project follows a backend-centric architecture using NestJS and Supabase.
For detailed architectural decisions, standards, and database modeling, refer to:
[LYDIAN_BACKEND_ARCHITECTURE.md](./LYDIAN_BACKEND_ARCHITECTURE.md)

## 🚀 Key Standards (v1)
- **API Versioning**: All endpoints use the `/v1/` prefix (configured in `main.ts`).
- **Rate Limiting**: Global limit of 60 requests/minute via `ThrottlerModule`.
- **Authentication**: Backend-centric using HttpOnly cookies.
- **Database**: Managed via Supabase migrations (SQL).

## 🛠️ Commands
- `npm run start:dev`: Start development server with watch mode.
- `npm run start:stg`: Start the compiled server with staging security settings.
- `npm run start:prod`: Start the compiled server with production security settings.
- `npm run build`: Build for production.
- `npm run test`: Run unit tests.
- `npm run lint`: Run ESLint with auto-fix.

## 📝 Git Commit History
- Never commit directly to `main`.
- Before changing code, update the local `main` from `origin/main` and create a
  dedicated working branch from that synchronized state.
- Use the `codex/` prefix for agent-created branches unless the user requests a
  different branch name.
- Commit and push changes only from the working branch. Changes must reach
  `main` through a reviewed Pull Request merge.
- Whenever a commit is requested, use a concise Conventional Commit title.
- The commit body is mandatory and must preserve the delivery history with:
  - a summary of the implemented scope;
  - features and files created or changed;
  - API, database, security, and configuration changes when applicable;
  - validations executed and their results;
  - known limitations or intentionally deferred items.
- Update `log.me` in the same commit with the current date and a detailed list of
  created and changed items.
- Never include secrets, `.env`, generated artifacts, or local infrastructure
  state in a commit.
