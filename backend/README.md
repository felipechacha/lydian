# Lydian API (NestJS + Supabase)

Este é o backend da aplicação Lydian, construído com **NestJS** e integrado ao **Supabase**.

## 🚀 Arquitetura e Decisões
A arquitetura utiliza uma estratégia **Backend-Centric**, onde o NestJS atua como um orquestrador seguro entre o Frontend e o Supabase.

- **Isolamento de Infra:** O Frontend nunca comunica-se diretamente com o Supabase (Auth ou DB).
- **Segurança Máxima:** Autenticação baseada em **HttpOnly Cookies**, protegendo contra ataques XSS e eliminando o uso de `localStorage` para tokens.
- **Escalabilidade:** Regras de negócio centralizadas no backend, permitindo evolução independente do frontend.

## 🛠️ Tecnologias
- **Framework:** [NestJS](https://nestjs.com/)
- **Banco de Dados & Auth:** [Supabase](https://supabase.com/)
- **Linguagem:** TypeScript
- **Segurança:** Cookie-parser, CORS com Credentials, Class-validator.

## 🔒 Autenticação (Cookie-Based)
A API utiliza cookies `access_token` e `refresh_token` com as flags `HttpOnly`, `Secure` (em produção) e `SameSite: Lax`.

### Configuração no Frontend (Angular)
Para que os cookies sejam enviados e recebidos corretamente, todas as requisições HTTP devem incluir a flag `withCredentials: true`.

**Exemplo de Interceptor no Angular:**
```typescript
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
```

---

## 📑 Referência da API

Todas as rotas usam o prefixo `/v1`. A documentação Swagger fica disponível em
`/v1/api` durante a execução da aplicação.

- Interface Swagger UI: `/v1/api`
- Especificação OpenAPI JSON: `/v1/api-json`
- Especificação OpenAPI YAML: `/v1/api-yaml`

As 38 operações documentam propriedades e exemplos dos DTOs, parâmetros
de path/query, cookies HttpOnly, headers `Origin`/`X-Request-ID`, respostas de
sucesso envelopadas, paginação, erros e o header de resposta `Set-Cookie` nos
fluxos de sessão. Um teste automatizado impede que novas rotas sejam adicionadas
sem a documentação mínima exigida.

### Infraestrutura

- `GET /v1/health` — health check público.
- `POST /v1/assets/upload-url` — URL assinada para upload privado de avatar/capa.
- `GET /v1/assets/signed-url` — URL temporária para leitura de asset do usuário.

### Autenticação

### 1. Signup (Criar conta)

- **Endpoint:** `POST /v1/auth/signup`
- **Acesso:** Público
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```
- **Erros relevantes:** `429` quando o limite de envio de e-mails do Supabase
  for excedido.

### 2. Login
- **Endpoint:** `POST /v1/auth/login`
- **Acesso:** Público
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Resposta:** `200 OK` + cookies configurados no navegador.
- **Erros relevantes:** `401` para credenciais inválidas, `403` para conta com
  e-mail ainda não confirmado e `429` para limites do Supabase Auth.

### 3. Logout
- **Endpoint:** `POST /v1/auth/logout`
- **Acesso:** Privado (precisa estar logado)
- **Resposta:** `200 OK`, sessão invalidada no Supabase e cookies removidos.

### 4. Refresh Token (Renovar Sessão)
- **Endpoint:** `POST /v1/auth/refresh`
- **Acesso:** Público (lê o `refresh_token` do cookie)
- **Resposta:** `200 OK` + novo par de cookies.

### 5. Me (Perfil do Usuário Logado)
- **Endpoint:** `GET /v1/auth/me`
- **Acesso:** Privado
- **Resposta:**
```json
{
  "id": "uuid-do-usuario",
  "email": "user@example.com",
  "role": "authenticated"
}
```

### Perfil

- `GET /v1/me`
- `PATCH /v1/me`
- `GET /v1/me/practice-goal`
- `PATCH /v1/me/practice-goal`

### Técnicas

- `GET /v1/techniques?category=&search=`

### Músicas

- `GET /v1/songs?page=1&limit=20&search=&sort_by=created_at&sort_order=desc`
- `GET /v1/songs/:id`
- `POST /v1/songs`
- `PATCH /v1/songs/:id`
- `PATCH /v1/songs/:id/techniques`
- `DELETE /v1/songs/:id`

### Setlists

- `GET /v1/setlists`
- `GET /v1/setlists/:id`
- `POST /v1/setlists`
- `PATCH /v1/setlists/:id`
- `DELETE /v1/setlists/:id`
- `POST /v1/setlists/:id/songs`
- `PATCH /v1/setlists/:id/songs/:songId`
- `DELETE /v1/setlists/:id/songs/:songId`

### Sessões de prática

- `GET /v1/practice-sessions`
- `GET /v1/practice-sessions/:id`
- `GET /v1/practice-sessions/history?page=1&limit=20&song_id=&from=&to=`
- `POST /v1/practice-sessions`
- `POST /v1/practice-sessions/start`
- `PATCH /v1/practice-sessions/:id`
- `POST /v1/practice-sessions/:id/finish`
- `DELETE /v1/practice-sessions/:id`
- `POST /v1/practice-sessions/:id/songs`
- `PATCH /v1/practice-sessions/:id/songs/:songId`
- `DELETE /v1/practice-sessions/:id/songs/:songId`

### Fundação de dados de prática

A migration `20260924000000_practice_data_foundation.sql` mantém os contratos
anteriores e adiciona a base para Home e Profile consumirem métricas reais:

- duração de músicas e sessões em segundos;
- pausas, BPM praticado, repetições e qualidade percebida;
- fonte externa neutra, status de aprendizado, BPM alvo e prioridade da música;
- catálogo normalizado de técnicas e associações com músicas e sessões;
- meta diária, frequência semanal e timezone por usuário;
- histórico enriquecido e paginado sem consultas N+1 no frontend;
- início e finalização atômicos de sessões por funções transacionais do banco.

Os campos legados em minutos e os campos `spotify_*` permanecem disponíveis
durante a migração do frontend. Novas integrações devem preferir segundos e os
campos neutros `provider`, `provider_track_id`, `preview_url` e `external_url`.

---

## 🛠️ Guia de Desenvolvimento

### Como proteger uma rota
Por padrão, **todas as rotas são privadas**. Para abrir uma exceção:
```typescript
@Public()
@Get('rota-aberta')
findAll() { ... }
```

### Como obter o usuário logado no Controller
```typescript
@Get('meu-recurso')
getData(@CurrentUser() user: AuthenticatedUser) {
  console.log(user.id);
  return ...;
}
```

### Como consumir o Supabase (Admin)
Use sempre o `SupabaseAdminClient` nos Repositórios para garantir bypass de RLS quando necessário pela regra de negócio:
```typescript
constructor(private readonly supabaseAdmin: SupabaseAdminClient) {}

async action() {
  const client = this.supabaseAdmin.getClient();
  return await client.from('table').select('*');
}
```

## ⚙️ Configuração Inicial
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env`:
   ```env
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   CORS_ORIGIN=http://localhost:4200
   ```

   `CORS_ORIGIN` lista os frontends externos autorizados, separados por
   vírgula. Requisições feitas pelo Swagger na própria origem da API são aceitas
   automaticamente, portanto `https://localhost:3000` não precisa ser incluído.

   `SUPABASE_ANON_KEY` e `SUPABASE_JWT_SECRET` são opcionais no MVP atual. O
   backend usa `SUPABASE_SERVICE_ROLE_KEY` internamente e nenhuma rota utiliza o
   cliente anon. Consulte `.env.example` para a configuração completa.

3. Com o [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
   instalado, aplique a migration local:
   ```bash
   npm run db:start
   npm run db:reset
   ```

Para aplicar as migrations a um projeto remoto previamente vinculado:

```bash
npm run db:push
```

As respostas de sucesso usam `{ "data": ... }`; listagens também retornam
`meta` com `page`, `limit` e `total`. O health check é a única resposta sem esse
envelope.

## 🚦 Executando

### Desenvolvimento

```bash
npm run start:dev
```

### Staging

```bash
npm run build
npm run start:stg
```

### Produção

```bash
npm run build
npm run start:prod
```

`npm start` também inicia o artefato já compilado em `dist/main`, respeitando o
`NODE_ENV` fornecido pelo ambiente. Ele não executa mais o watch de
desenvolvimento.

## ☁️ Deploy no Render

### Hospedagem atual

| Item | Valor |
| --- | --- |
| Provedor | [Render](https://render.com/) |
| Tipo | Web Service Node.js |
| Workspace | `Lydian` |
| Projeto / ambiente | `My project` / `Production` |
| Serviço | `lydian-app-api` |
| Service ID | `srv-da4ifbojo6nc73d44qu0` |
| Região | Virginia — US East |
| Plano atual | Free |
| Repositório | [Bitbucket — lydian-app-api](https://bitbucket.org/codemakerprojetos/lydian-app-api) |
| Branch publicada | `main` |
| URL pública | [https://lydian-app-api.onrender.com](https://lydian-app-api.onrender.com) |
| Painel do serviço | [Render Dashboard](https://dashboard.render.com/web/srv-da4ifbojo6nc73d44qu0) |

Endpoints operacionais do ambiente publicado:

- Health check: [https://lydian-app-api.onrender.com/v1/health](https://lydian-app-api.onrender.com/v1/health)
- Swagger UI: [https://lydian-app-api.onrender.com/v1/api](https://lydian-app-api.onrender.com/v1/api)
- OpenAPI JSON: [https://lydian-app-api.onrender.com/v1/api-json](https://lydian-app-api.onrender.com/v1/api-json)

O serviço deve ser criado como **Web Service** Node.js e vinculado à branch
`main` do Bitbucket. Como o serviço já foi criado pelo painel, não é necessário
adicionar um `render.yaml`; isso evitará criar uma segunda definição de
infraestrutura acidentalmente.

Configure no Render:

| Campo | Valor |
| --- | --- |
| Runtime | `Node` |
| Branch | `main` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start:prod` |
| Health Check Path | `/v1/health` |
| Auto-Deploy | `On Commit` (ou manual, conforme o fluxo do time) |

O Render fornece `PORT` dinamicamente. A API lê essa variável e escuta em
`0.0.0.0`, portanto não fixe a porta `3000` no painel. A versão do Node está
limitada no `package.json` a `>=24.14.0 <25` para impedir mudanças inesperadas
de major no runtime.

### Variáveis no Render

Cadastre os valores no menu **Environment** do serviço, nunca no repositório:

| Variável | Produção | Staging | Observação |
| --- | --- | --- | --- |
| `NODE_ENV` | `production` | `staging` | Obrigatória; controla cookies seguros e validações do ambiente. |
| `SUPABASE_URL` | URL do projeto de produção | URL do projeto de staging | Obrigatória. |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret de produção | Secret de staging | Obrigatória e confidencial. |
| `CORS_ORIGIN` | URL(s) do frontend de produção | URL(s) do frontend de staging | Obrigatória; múltiplas origens são separadas por vírgula. |
| `PORT` | Não cadastrar | Não cadastrar | Fornecida automaticamente pelo Render. |
| `SUPABASE_ANON_KEY` | Opcional | Opcional | Não utilizada no MVP atual. |
| `SUPABASE_JWT_SECRET` | Opcional | Opcional | Não utilizada no MVP atual. |

No campo **Value** do Render, informe somente o valor da variável. Exemplo
correto para múltiplas origens:

```text
http://localhost:4200,https://frontend.seudominio.com
```

Não repita `CORS_ORIGIN=` dentro do valor, pois a aplicação interpretará esse
prefixo como parte da URL e interromperá o startup.

Para manter `SameSite=Lax` nos cookies HttpOnly, prefira publicar a API em um
subdomínio do mesmo site do frontend, por exemplo `api.seudominio.com`. Se o
frontend e a API permanecerem em sites diferentes, como um domínio próprio e
`onrender.com`, o navegador pode bloquear os cookies nas chamadas XHR; esse
cenário exige uma decisão explícita de segurança antes de alterar para
`SameSite=None`.

As migrations do Supabase não devem ser executadas no Start Command. Quando
houver uma nova migration versionada, aplique-a separadamente ao projeto do
ambiente antes do deploy da API.
