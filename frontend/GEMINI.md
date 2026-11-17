# Diretrizes do Projeto: Lydian Music Front

Este documento define os padrões arquiteturais, de código e fluxos de trabalho para este projeto.

## 🏗️ Arquitetura Geral

- **Framework**: Angular 20 (Bleeding Edge)
- **Componentes**: Arquitetura 100% Standalone (sem NgModules).
- **Renderização**: Server-Side Rendering (SSR) com Angular SSR e Express.
- **Controle de Fluxo**: Uso obrigatório da nova sintaxe `@if`, `@for`, `@switch`.

## 📂 Estrutura de Pastas

- A arquitetura do front-end é **feature-first** e não uma adaptação de Clean Architecture.
- `src/app/core/`: infraestrutura global e singleton da aplicação (sessão/autenticação, interceptors, HTTP, SEO, guards e configuração).
- `src/app/shared/ui/`: componentes visuais reutilizáveis, agnósticos de feature (ex: shell, header, navegação e controles de visualização).
- `src/app/shared/directives/`, `pipes/` e `utils/`: recursos reutilizáveis sem regra de negócio de uma feature.
- `src/app/features/<feature>/`: cada domínio funcional agrupa suas próprias `pages/`, `components/`, `models/`, `data-access/`, `services/` e rotas conforme a necessidade real.
- Não criar pastas vazias apenas para reproduzir a estrutura. Uma camada local deve existir quando a feature possuir responsabilidade correspondente.
- Componentes específicos de uma feature não devem ser promovidos para `shared`.
- Estado e acesso a dados específicos de uma feature devem permanecer no `data-access` da própria feature. Apenas infraestrutura realmente global deve ficar em `core`.
- Cada feature expõe suas rotas em um arquivo `<feature>.routes.ts`. O `app.routes.ts` apenas compõe essas rotas, mantendo as páginas com lazy loading via `loadComponent`.
- `src/styles/`: Sistema de design SCSS (variáveis, mixins, tipografia).

## 🎨 Estilização e UI

- **CSS/SCSS**: Uso de variáveis e mixins globais.
- **Bootstrap 5**: Importado via CDN no `index.html` para performance.
- **Fontes**: Google Fonts (Inter e Roboto) importadas via CDN no `index.html`.
- **GSAP**: Biblioteca principal para animações.
  - **Regra de Ouro (SSR)**: Animações GSAP que tocam no DOM devem estar no `ngAfterViewInit` e protegidas por `if (isPlatformBrowser(this.platformId))`.
  - **Estabilidade HMR**: SEMPRE utilizar `gsap.context()` dentro do `setTimeout` para inicializar e `ctx.revert()` no `ngOnDestroy`. Isso garante que o Hot Reload e o SSR não quebrem as animações.

### 5. Formulários e Validações

- **Reactive Forms**: Uso obrigatório para qualquer formulário que possua validação ou mais de 2 campos. Evitar Template-Driven Forms (`ngModel`).
- **Validação**: Sempre fornecer feedback visual claro (`.is-invalid`) e mensagens de erro contextuais usando a sintaxe `@if`.
- **Typed Forms**: Utilizar `fb.nonNullable` para garantir segurança de tipos nos controles.

### 6. Layout e Encapsulamento

- **Uso do `:host`**: Para componentes que funcionam como overlays ou wrappers (ex: Loaders, Modais), utilizar `:host { display: block; position: absolute; ... }` para evitar que a tag customizada do Angular desloque outros elementos da página.
- **Bootstrap Cirúrgico**: Utilizar Bootstrap apenas para malha estrutural (grid) e utilitários indispensáveis. Estilizações de design (cores, bordas, sombras) devem ser feitas via classes `-custom` no SCSS para manter controle total e evitar poluição do HTML ("anti-Tailwind").

### 7. UX e Feedback Visual

- **Skeleton Loaders**: Uso obrigatório de `ngx-skeleton-loader` ou equivalentes para estados de carregamento de dados em tabelas e cards.
- **Empty States**: Sempre tratar o cenário de "nenhum resultado encontrado" com ilustrações e mensagens claras no template.

## 🛠️ Padrões de Código

### 1. Criação de Componentes

Sempre utilizar o Angular CLI para garantir a criação de estilos e **testes obrigatórios**:

```bash
npm run ng -- generate component features/nome-feature/components/nome-componente
```

_Nota: Nunca utilizar `--skip-tests`._

### 2. Encapsulamento e Estado (TypeScript)

- **Variáveis Privadas**: Seguir o padrão de prefixo `_` para membros privados (ex: `_isLoading`).
- **Acesso Público**: Expor estado privado via `getters` públicos (ex: `get isLoadingData()`).
- **Determinismo**: Lógicas de UI (como definição de classes dinâmicas) devem ser tratadas no TS (ex: `applyStyleStatus(status: string): string`) e não em expressões complexas no HTML.

### 3. Manipulação Dinâmica de Formulários

- **Controle Dinâmico**: Adicionar ou remover controles de formulário em tempo de execução (`removeControl`/`addControl`) baseado no estado da aplicação, garantindo que o objeto do formulário reflita exatamente o que está na tela.
- **Feedback de Inputs**: Incluir contadores de caracteres e validações em tempo real para campos de texto longos.

### 4. Tratamento de Requisições HTTP

- **Interceptor**: `authInterceptor` funcional (em `core/interceptors`).
- **JWT**: Injeção automática do token do `localStorage` nos headers.
- **Tratamento de Erros**: Blocos `if` explícitos para códigos HTTP (401, 403, 404, 500) para facilitar escala.
- **Nomenclatura e Legibilidade**:
  - EVITAR abreviações (ex: `res`, `err`, `req`). Exceção permitida: `params`.
  - Utilizar sempre nomes completos e descritivos (ex: `response`, `error`, `request`).
  - Esta regra aplica-se a variáveis, parâmetros de funções/callbacks e propriedades de objetos.
- **RxJS Subscribe**: SEMPRE utilizar o padrão de objeto para `.subscribe({ next: ..., error: ..., complete: ... })`.
  - O `complete` deve ser usado obrigatoriamente para limpar estados de UI (loadings, spinners, habilitar botões) que não dependem do sucesso ou falha da requisição.
- **Cleanup de Memória**: Utilizar `Subject` + `takeUntil` para destruir subscrições em componentes que não usam o pipe `async`.

### 5. Configuração e Ambientes

- **Multi-Ambiente**: Configurar e manter perfis distintos no `angular.json` (`dev`, `uat`, `stg`, `prod`) com substituição de arquivos de ambiente e templates de `index.html` específicos quando necessário.
- **Versionamento**: Logar a versão da aplicação no `AppComponent` durante a inicialização para facilitar debug em produção.

### 6. SEO

- Utilizar o `SeoService` em todas as páginas no `ngOnInit` para atualizar metatags dinamicamente.

### 7. Grid e Responsividade (Bootstrap)

- **Estrutura obrigatória de página**: utilizar `section > .container > .row > .col-12...` antes de inserir os componentes da feature.
- **Semântica**: nunca aninhar uma `<section>` diretamente dentro de outra `<section>`. As seções de uma página devem ser irmãs.
- **Componentes agnósticos de grid**: componentes filhos não devem assumir `container`, `row` ou largura de coluna. A página é responsável por posicioná-los no grid para permitir seu reaproveitamento.
- **Regra de Ouro**: Nunca utilizar apenas classes para desktop. Toda coluna deve ter sua definição para mobile explicitada.
- **Padrão**: Priorizar `col-12` para mobile, subindo para `col-md-*` ou `col-lg-*` conforme o layout.
- **Exemplo**: `class="col-12 col-md-6 col-lg-4"` (Garante 1 coluna no mobile e o grid desejado no desktop).

- Carregamento de imagens via `NgOptimizedImage`.
- Lazy loading em todas as rotas de páginas.
- Uso de `stylePreprocessorOptions` no `angular.json` para facilitar imports SCSS.
- **Importação Local**: Todo arquivo `.scss` de componente DEVE importar explicitamente as variáveis e mixins se for utilizá-los (ex: `@import 'styles/variables'; @import 'styles/mixins';`), pois o escopo do Sass em componentes é isolado.

## 🌿 Fluxo de Git

- Criar branches de trabalho sempre a partir da `main` atualizada.
- Seguir o formato `<tipo>/<descrição-em-kebab-case>`, usando os tipos `feat`, `fix`, `refactor`, `chore`, `docs`, `test` ou `hotfix` conforme a natureza do trabalho.
- Não adicionar prefixos de ferramenta ou agente aos nomes das branches (por exemplo, `codex/`).
- Manter cada branch focada em uma única feature, correção ou responsabilidade arquitetural.
- Utilizar Conventional Commits no formato `<tipo>: <descrição objetiva no imperativo>`, separando commits quando houver mudanças independentes.
- Antes de preparar um commit, validar os testes relacionados, executar `git diff --check` e revisar os arquivos que serão adicionados ao staging.
- Antes de **todo commit**, atualizar o `LOGS.md` no mesmo commit com as alterações entregues, decisões relevantes, validações, limitações conhecidas e contexto suficiente de branch para que outro desenvolvedor ou LLM continue o trabalho com segurança.
- Se um commit for solicitado e o `LOGS.md` ainda não descrever o trabalho atual, atualizar o histórico antes de adicionar os arquivos ao staging. Não criar commits de implementação com handoff desatualizado.
- Não atualizar o `TIME_TRACKING.md` automaticamente em commits comuns. O tracker só deve ser atualizado quando o usuário pedir explicitamente o registro de tempo ou a atualização do tracker, pois esse pedido representa o encerramento da sessão de trabalho.

## 🧪 Validação durante o desenvolvimento e QA

- **Proibição por padrão**: não executar a skill `agent-browser`, os scripts `qa:browser:*` nem qualquer automação de navegador durante o desenvolvimento, a menos que o usuário solicite explicitamente uma rodada de QA.
- A existência da skill, dos scripts e de uma tarefa anterior de QA não constitui autorização para reutilizá-los em tarefas posteriores.
- QA automatizado é uma etapa separada e posterior ao desenvolvimento. Não deve ser iniciado de forma preventiva para validar uma implementação.
- Durante o desenvolvimento, validar alterações como desenvolvedores: inspeção e debug do código, análise de tipos, build, testes unitários/integrados de código e `git diff --check`.
- Quando o usuário solicitar explicitamente QA automatizado, seguir integralmente as regras de isolamento, HTTPS, autenticação e armazenamento de artefatos descritas em `AGENTS.md` e `QA_AUTOMATION.md`.
