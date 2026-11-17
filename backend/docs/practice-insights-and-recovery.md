# Indicadores de prática, setlists e recuperação de senha

Entrega de 12/10/2026, branch `feat/practice-insights-recovery`, base `origin/main`
`56ee653`. Escopo exclusivamente backend. As migrations foram aplicadas e o setup de
desenvolvimento do Supabase foi concluído nesta sessão. Integração frontend e
publicação da API continuam como etapas separadas. Waitlist, billing e Discover
aguardam desenho de produto.

## Contratos

- `GET /v1/me/practice-summary`: privado, envelope `{ data }`, resumo completo
  para Home/Profile em uma RPC. Inclui meta, totais históricos, BPM médio,
  músicas dominadas, sequência atual/máxima, prática de hoje, semana atual e
  anterior, calendário de sete dias, evolução de 12 semanas, métricas por técnica
  e conquistas derivadas. Nenhuma limitação de paginação sobre o histórico.
- `GET /v1/setlists`: mantém `{ data, meta }`, busca e ordenação existentes;
  acrescenta `song_count`, `duration_seconds`, `missing_duration_count` e
  `cover_image_urls` (até quatro capas na ordem do repertório). Dados calculados
  no banco apenas para a página solicitada. Duração zero pode representar uma
  lista vazia ou músicas sem duração; consultar `missing_duration_count`.
- `PATCH /v1/setlists/:id/songs/order`: privado, body `{ "song_ids": ["uuid", ...] }`.
  Lista completa de músicas ativas, únicas, máximo de 1000 IDs. Transação verifica
  ownership, aplica posições contíguas a partir de zero e preserva associações
  removidas/inconsistentes após as ativas. Resposta `{ data: { id } }`.
- `POST /v1/auth/forgot-password`: público, body `{ "email": "usuario@exemplo.com" }`.
  Resposta 200 genérica para e-mails válidos, inclusive contas inexistentes. Não
  aceita URL de retorno enviada pelo cliente.
- `POST /v1/auth/reset-password`: público, body `{ "token_hash": "...", "password": "..." }`.
  Verifica o hash exclusivamente como token `recovery`; atualiza a senha num
  client SDK isolado, revoga refresh tokens globalmente e remove cookies. Não
  retorna sessão/tokens. Exige novo login. Senha mínima de seis caracteres,
  compatível com cadastro, máximo de 128; políticas adicionais são do Supabase.
  Tokens inválidos, expirados ou reutilizados retornam 401. Ambos os endpoints
  de recuperação têm limite de cinco chamadas por IP em cinco minutos e Origin
  Guard. Detalhes sensíveis do provedor não são retornados nesses fluxos.

- `POST /v1/auth/reset-password/session`: fluxo escolhido para desenvolvimento,
  sem SMTP personalizado. Body `{ "recovery_token": "...", "refresh_token": "...",
  "password": "..." }`. O primeiro valor vem da query do link de e-mail; o refresh
  token vem do fragmento retornado pelo Supabase ao abrir o link. O backend valida
  a sessão no Supabase e consome atomicamente a prova do e-mail, vinculada ao
  endereço verificado, com validade de uma hora. Provas inválidas, usadas,
  expiradas ou de outro e-mail retornam 401; sessão comum sem prova não permite
  alteração. Mesma resposta, cookies e limite de cinco chamadas/cinco minutos
  do endpoint de TokenHash. O frontend deverá limpar query/fragmento, manter
  esses valores apenas em memória e enviá-los exclusivamente no body.

`PASSWORD_RECOVERY_MODE=default` usa o template padrão. Cada solicitação gera uma
prova aleatória de 256 bits enviada somente no redirect do e-mail; o banco armazena
apenas hashes da prova e do e-mail, expiração e consumo. Registros expirados são
removidos em solicitações posteriores. A prova não aparece na resposta pública.
`token_hash` continua disponível como alternativa quando houver SMTP/template
personalizado. Login, cadastro, refresh e recovery usam clients SDK isolados para
não trocar a identidade do client administrativo usado pelas consultas/RPCs.

## Regras dos indicadores

- Somente sessões concluídas, não removidas e não futuras contam. O tempo ativo
  usa `duration_seconds`, com fallback legado `duration_minutes * 60`, sem somar
  pausas. Sessões sem duração contam no total de sessões, mas não geram dias de
  prática ou sequência.
- Cada sessão pertence ao dia de seu `started_at` no timezone IANA da meta,
  inclusive se atravessar a meia-noite. Uma mudança de timezone recalcula o
  histórico. A semana começa na segunda-feira. Sem meta, usar UTC, 1800 segundos
  diários e cinco dias semanais, como o contrato existente de meta.
- Sequência conta dias consecutivos com tempo positivo. A atual pode terminar
  hoje ou ontem; uma lacuna anterior encerra a sequência. A meta semanal conta
  dias com prática positiva; `goal_reached_days` informa separadamente os dias
  que atingiram a duração diária.
- Músicas dominadas usam o status explícito `mastered`, excluindo removidas.
  BPM/qualidade são médias simples dos registros que possuem esse valor, não
  uma pontuação fictícia de habilidade. Tempo por técnica corresponde ao tempo
  da associação praticada: quando há várias técnicas, cada uma recebe o tempo
  inteiro da associação, portanto não se devem somar técnicas para obter o total.
- Conquistas desta entrega são calculadas, sem tabela ou concessão permanente:
  primeira sessão concluída, sequência máxima de sete dias, 36000 segundos
  históricos. Remover sessões pode alterar o desbloqueio. Ranking, níveis,
  percentual de domínio, timbre e recomendações pedagógicas ainda precisam de
  regras de produto; não são inferidos a partir de métricas inexistentes.
- Remover uma música preserva o tempo histórico da sessão, mas a exclui de
  métricas por técnica/BPM e dos resumos de setlist.

## Configuração e estado confirmado em 12/10/2026

- Projeto vinculado: `usbrvaacbsrsgxejjepd`. Estava inativo, foi reativado e
  confirmado como `ACTIVE_HEALTHY` antes de aplicar as migrations.
- `20261012000000_practice_insights_setlist_summaries.sql` e
  `20261012010000_password_recovery_requests.sql` aplicadas via `npm run db:push -- --yes`.
  Histórico remoto contém as quatro migrations locais; dry-run final confirmou
  `upToDate: true`, sem migrations pendentes.
- Auth Site URL: `https://localhost:4200`. Allowlist inclui o formulário
  `https://localhost:4200/reset-password/confirm` e a variante restrita
  `https://localhost:4200/reset-password/confirm?recovery_token=*`.
- `.env` local (ignorado pelo Git): `PASSWORD_RESET_REDIRECT_URL` aponta para o
  formulário HTTPS e `PASSWORD_RECOVERY_MODE=default`. URL validada contra CORS,
  sem query/fragmento/credenciais na configuração fixa. A prova é acrescentada
  pelo servidor exclusivamente no envio do link.
- Por escolha do usuário, usar o envio padrão apenas para desenvolvimento. O
  provedor padrão permite e-mails somente para membros da equipe do projeto,
  com limite atual de dois por hora. Não foi configurado SMTP personalizado.
- O Supabase bloqueou a alteração do template no projeto gratuito com provedor
  padrão. O template remoto original foi preservado; o fluxo por sessão/prova
  foi implementado e validado para dispensar essa alteração. O arquivo
  `supabase/templates/recovery.html` permanece preparado para futura adoção de
  SMTP e `PASSWORD_RECOVERY_MODE=token_hash`; não está ativado no TOML local.
- Verificação real com conta descartável: RPCs de agregados, resumo paginado,
  reordenação, recovery por TokenHash, link padrão/redirect HTTPS, troca de senha,
  rejeição da senha antiga e reuso, novo login e revogação passaram. Conta,
  registros relacionados e prova de teste removidos ao final. `generateLink`
  não enviou e-mails; entrega na caixa postal não foi testada.

Para integrar o frontend, criar o formulário de confirmação na URL configurada
antes de expor o CTA de recuperação. Em produção, configurar URL pública,
allowlist e variáveis da API publicada, além de SMTP personalizado. Nenhuma
publicação no Render ou alteração frontend foi feita nesta sessão.

Após uma verificação/consumo, a prova de recuperação é de uso único mesmo se a
política de senha rejeitar a alteração; solicitar outro link nesses casos.
Revogação global encerra refresh tokens, mas JWTs de acesso já emitidos podem
permanecer válidos até expirar. Falha de revogação após mudança da senha responde
503 informando o estado parcial.

Referências oficiais:
[resetPasswordForEmail](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail),
[templates de e-mail](https://supabase.com/docs/guides/auth/auth-email-templates).

## Validação

Usar Node 24 e npm. `npm ci`, `npm test -- --runInBand`,
`npm run test:e2e -- --runInBand`, `npm run test:db`, `npm run build`,
`npm run lint` e `git diff --check`.

`test:db` usa PostgreSQL embutido PGlite exclusivamente em memória. Auth/storage
são estruturas mínimas de teste; todas as migrations de aplicação executam sem
alterações. O SQL em `supabase/tests` testa mais de 1100 sessões, timezone/DST,
soft delete, ownership, metas, sequência, resumo/paginação e reordenação atômica.
Os testes HTTP simulam o Supabase; não comprovam envio de e-mail ou configuração
SMTP do projeto remoto. Nenhum QA de navegador foi realizado.

Resultados finais após setup: 96 testes unitários e 23 testes HTTP aprovados;
regressões SQL, build, lint e `git diff --check` aprovados. Sem commit ou deploy.


## Publicação dos contratos integrados — 12/10/2026

O frontend já consome estes contratos em sua branch
`feat/practice-summary-recovery-integration`. A confirmação de senha limpa os
tokens da URL e os mantém somente em memória. A entrega de backend segue para
`main` a partir de `feat/practice-insights-recovery`; o deploy deve ser verificado
no [serviço Render existente](https://dashboard.render.com/web/srv-da4ifbojo6nc73d44qu0).
Não versionar .env nem credenciais de infraestrutura.

Para testar a API publicada com o frontend local, configurar no Render:

- `PASSWORD_RESET_REDIRECT_URL=https://localhost:4200/reset-password/confirm`;
- `PASSWORD_RECOVERY_MODE=default`;
- incluir `https://localhost:4200` em `CORS_ORIGIN`, preservando origens públicas
  já autorizadas. A origem da URL de retorno precisa constar nessa lista.

Conferir no Supabase do ambiente publicado a allowlist do formulário, a variante
`https://localhost:4200/reset-password/confirm?recovery_token=*` e as quatro
migrations. Setup da sessão foi realizado somente no projeto vinculado descrito
acima. Se o Render apontar para outro projeto, preparar esse banco antes do deploy.
Para um frontend público, substituir o localhost pela origem do ambiente que
receberá a recuperação e alinhar CORS/allowlist; não mudar essas configurações
remotas implicitamente a partir dos exemplos locais.

Após o deploy, conferir `/v1/health`, `/v1/api-json` e a presença dos endpoints
`/v1/me/practice-summary`, `/v1/setlists/:id/songs/order`,
`/v1/auth/forgot-password`, `/v1/auth/reset-password` e
`/v1/auth/reset-password/session`. O envio padrão continua limitado a membros
autorizados do projeto; SMTP próprio e entrega real na caixa postal não foram
validados.
