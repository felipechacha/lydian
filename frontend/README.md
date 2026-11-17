# LydianFront

## Documentação do App Web

Abra [LYDIAN_WEB_DOCUMENTATION.html](./LYDIAN_WEB_DOCUMENTATION.html) para consultar
o funcionamento de cada página e sua composição técnica. O guia oferece visões
de UI, técnica ou ambas, busca, filtros por situação, componentes/eventos,
endpoints, contratos, arquivos de referência e impressão em PDF. Inclui ilustrações
explicativas, ampliação/zoom e um fluxograma completo da navegação. Ao compartilhar
o documento, mantenha junto a pasta `docs/assets/lydian-web`.


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `https://localhost:4200/`. HTTPS is mandatory locally because the application uses credentialed requests and session cookies. The application will automatically reload whenever you modify any of the source files.

The default local profile sends API requests to the relative path `/v1`. The
Angular development server proxies those requests to
`https://lydian-app-api.onrender.com` using [`proxy.conf.json`](./proxy.conf.json).
This keeps the browser interaction same-origin on `https://localhost:4200`, so
the HttpOnly session cookies returned by login are available to refresh and
protected requests without changing the production `SameSite=Lax` policy.
The `development` build is browser-focused (`outputMode: static`, without
runtime SSR) so API calls are handled by the local proxy instead of the server
renderer. The Nginx production profile is also static; the dedicated SSR build
remains available through `npm run build:ssr`.

Authentication routes continue to use the `/v1/auth` prefix. Start the client
with `npm start`; do not call the Render URL directly from the local environment
or bypass the configured proxy. The published API must allow
`https://localhost:4200` in `CORS_ORIGIN` with credentials enabled.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
npm run ng -- generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
npm run ng -- generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Production with Nginx

The production build uses `/v1` as its API base URL. The provided
[`Dockerfile`](./Dockerfile) builds the Angular application and serves the
static output through Nginx. Requests to `/v1/*` are forwarded server-to-server
to the HTTPS API, keeping authentication cookies and JWT requests same-origin
from the browser's perspective.

Build and run the production image with Docker:

```bash
npm run container:build
npm run container:config:test
npm run container:run
```

The container exposes:

- `/health` for the frontend container health check;
- `/v1/*` as the API reverse proxy;
- every other path as the Angular SPA, with fallback to `index.html`.

`API_UPSTREAM` must contain only the API origin, without the `/v1` suffix or a
trailing slash. TLS should terminate at the hosting provider or load balancer;
the Nginx container still connects to the upstream API over HTTPS. Do not point
the production Angular environment directly to the Render domain, otherwise
the browser will bypass this proxy and the cookie/JWT flow becomes cross-origin
again.

### Render frontend service

The frontend must be deployed as a **Docker Web Service**, not as a Render
Static Site, because the reverse proxy needs a running Nginx process.

Configure the frontend service with:

| Setting | Value |
| --- | --- |
| Runtime | `Docker` |
| Dockerfile | `./Dockerfile` |
| Health Check Path | `/health` |
| Environment variable | `API_UPSTREAM=https://lydian-app-api.onrender.com` |
| `PORT` | Do not set; Render provides it |

The Render load balancer terminates public HTTPS and forwards traffic to the
port injected through `PORT`. The Nginx template listens on that port and keeps
the upstream API connection on HTTPS.

### Render backend service

No backend code change is required for this proxy. Keep the API service as a
Node Web Service with:

| Setting | Value |
| --- | --- |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start:prod` |
| Health Check Path | `/v1/health` |
| `PORT` | Do not set; Render provides it |

The backend environment must keep its existing Supabase secrets and include:

```env
NODE_ENV=production
CORS_ORIGIN=https://frontend-service.onrender.com,https://app.example.com,https://localhost:4200
```

Replace the example frontend origins with the actual Render URL and custom
domain. Values are comma-separated, without quotes or trailing slashes. Even
though the production Nginx hop removes the browser `Origin` before forwarding
the same-origin request, the allowlist remains necessary for authorized direct
access, local development and operational tooling.

Do not configure cookie `Domain` as `onrender.com`. The API already emits
HttpOnly, Secure and `SameSite=Lax` cookies without an explicit domain, so a
login response passing through Nginx is stored against the frontend host. Nginx
forwards both the cookies and any `Authorization` header on later requests.

After deployment, validate in this order:

1. `GET https://<frontend>/health` returns the frontend container health.
2. `GET https://<frontend>/v1/health` returns the API health response.
3. Login returns `Set-Cookie` for the frontend host.
4. `GET https://<frontend>/v1/me` returns the authenticated user.
5. Refresh and one protected mutation work through the `/v1` proxy.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm test -- --watch=false
```

## Running end-to-end tests

The project does not currently have an end-to-end target configured. Angular CLI does not include an end-to-end testing framework by default; one must be configured before adding an npm script for it.

## Automated exploratory QA

Automated browser QA is a separate post-development stage and is prohibited by default. Only run `agent-browser` or a `qa:browser:*` script when the user explicitly requests QA in the current task. Normal development validation must be performed through code inspection and debugging, build/type checks, code-level tests, and `git diff --check`; a previous QA request does not carry over to later work.

The project includes `agent-browser` as a local development dependency for agent-driven browser QA. Install its browser runtime once with:

```bash
npm run qa:browser:install
```

The official agent skill is versioned at [`.agents/skills/agent-browser/SKILL.md`](./.agents/skills/agent-browser/SKILL.md). It is a discovery stub: before browser automation, the agent loads the `core` and `dogfood` workflows exposed by the installed CLI so that its instructions remain aligned with the package version.

```bash
npm run qa:browser:skill
npm run qa:browser:skill:qa
```

Start the application and open the isolated HTTPS QA session with:

```bash
npm start
npm run qa:browser:open
npm run qa:browser:snapshot
```

Close the browser session after the test:

```bash
npm run qa:browser:close
```

All project automation must use the `qa:browser:*` npm scripts; no global installation or `npx` is required. Generated reports, screenshots, videos, HAR files, and temporary authentication state are ignored by Git. Follow [QA_AUTOMATION.md](./QA_AUTOMATION.md) for isolated HTTPS checks, accessibility audits, Web Vitals collection, screenshots, and exploratory authentication flows.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Lydian Credentials test

As credenciais documentadas para o endpoint de login são:

- Usuário: test@lydian.com
- Senha: LydianTest123!

O usuário precisa existir no projeto Supabase configurado pela API local. Caso contrário, o endpoint responderá com `401 Invalid credentials`.

## Usuário Teste

Para login em DEV use as credenciais abaixo:

- email: felipeimenda04.lydian@gmail.com
- senha: Teste@1234
