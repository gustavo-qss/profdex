# ProfDex — Visão Geral do Projeto

> **Para quem é este documento?** Alunos que estão conhecendo o projeto pela primeira vez e não têm familiaridade com as tecnologias usadas. Também serve como contexto completo para LLMs que precisam entender o código sem ter lido cada arquivo.

---

## O que é o ProfDex?

ProfDex é uma aplicação gamificada inspirada no Pokédex. Alunos usam a câmera do celular para **escanear marcadores físicos** espalhados pelo campus e "descobrir" professores via Realidade Aumentada (AR). Depois, ao encontrar o professor pessoalmente e escanear dois marcadores ao mesmo tempo, o aluno "captura" o professor e o adiciona ao seu ProfDex.

**Fluxo principal:**
1. Aluno se cadastra com matrícula e senha.
2. Aponta a câmera para um marcador físico (cartaz/card) → **descobre** o professor.
3. Encontra o professor pessoalmente, posiciona dois marcadores na câmera ao mesmo tempo → **captura** o professor.
4. O professor aparece no ProfDex do aluno com a foto e nome revelados.

---

## Estrutura dos Repositórios

```
profdex/          ← Frontend (Vue 3, roda no navegador do celular)
profdex-back/     ← Backend (NestJS, API REST + banco de dados)
```

A comunicação acontece via HTTP/JSON: o frontend chama a API do backend para autenticar, listar professores, registrar descobertas e capturas.

---

## Frontend — `profdex/`

### Tecnologias

#### Vue 3
**O que é:** Framework JavaScript para construir interfaces web reativas. Em vez de manipular o HTML diretamente com JavaScript, você descreve *como* a tela deve parecer com base em dados, e o Vue atualiza o DOM automaticamente quando os dados mudam.

**Como é usado aqui:** Toda tela (Login, ProfDex, Scanner AR, Captura) é um componente Vue (arquivos `.vue`). Cada arquivo `.vue` tem três partes:
- `<script setup>` — lógica em JavaScript
- `<template>` — HTML com diretivas Vue (`v-if`, `v-for`, `@click`, etc.)
- `<style scoped>` — CSS que afeta apenas aquele componente

**Principais arquivos:**
- `src/views/` — telas completas (HomeView, LoginView, ProfdexView, ScanView, CaptureView, RegisterView)
- `src/components/ProfCard.vue` — componente reutilizável do card de professor

**Conceitos importantes do Vue usados:**
- `ref()` — cria uma variável reativa (quando muda, a tela atualiza automaticamente)
- `computed()` — valor derivado de outros reativos (ex: `isAuthenticated` calculado a partir do token)
- `onMounted()` — função executada quando o componente aparece na tela
- `<script setup>` — sintaxe moderna do Vue 3 que evita boilerplate

#### Vite
**O que é:** Ferramenta de build (empacotamento) e servidor de desenvolvimento. Substitui o Webpack em projetos modernos — é muito mais rápido porque só recompila o que mudou.

**Como é usado aqui:** `npm run dev` inicia o servidor local com hot-reload (a tela atualiza automaticamente ao salvar o arquivo). `npm run build` gera os arquivos estáticos para produção.

**Por que importa para LLMs:** `import.meta.env.VITE_API_URL` é a forma de ler variáveis de ambiente no Vite (arquivo `.env`). Não use `process.env` — não funciona aqui.

#### Pinia
**O que é:** Gerenciador de estado global do Vue. Quando diferentes componentes precisam compartilhar dados (ex: o usuário logado), esses dados ficam num "store" centralizado em vez de passar props entre componentes.

**Como é usado aqui:**
- `src/stores/auth.js` — guarda o token JWT e dados do usuário; fornece `login()`, `logout()`, `register()`
- `src/stores/professors.js` — lista de professores com status de descoberta/captura; fornece `fetch()`, `discover()`, `capture()`

**Padrão usado:** Composition API (função `defineStore` com `ref` e `computed` internamente), que é o estilo moderno do Pinia.

#### Vue Router
**O que é:** Biblioteca de roteamento client-side. Em SPAs (Single Page Applications), o navegador não recarrega a página ao navegar — o Vue Router troca o componente exibido de acordo com a URL.

**Como é usado aqui:** `src/router/index.js` define 6 rotas:
- `/` → `HomeView` (pública)
- `/login` e `/register` → acessíveis apenas para não-autenticados (`meta: { guest: true }`)
- `/profdex`, `/scan`, `/capture` → acessíveis apenas para autenticados (`meta: { auth: true }`)

O `router.beforeEach` é um guard de navegação: redireciona automaticamente para `/login` se tentar acessar rota protegida sem token, ou para `/profdex` se tentar acessar `/login` já logado.

#### Axios
**O que é:** Biblioteca HTTP para fazer requisições ao backend. Mais ergonômica que o `fetch` nativo — suporta interceptors, cancelamento, e serializa/deserializa JSON automaticamente.

**Como é usado aqui:** `src/services/api.js` cria uma instância configurada com:
- `baseURL` apontando para o backend (padrão: `http://localhost:3000/api`)
- Interceptor que injeta o header `Authorization: Bearer <token>` automaticamente em toda requisição, lendo o token do `localStorage`

#### MindAR + Three.js
**O que são:**
- **Three.js** — biblioteca 3D para WebGL. Cria e renderiza cenas 3D no navegador via `<canvas>`.
- **MindAR** — biblioteca de Realidade Aumentada baseada em Three.js. Usa a câmera do dispositivo para detectar imagens-alvo (markers) e sobrepor conteúdo 3D sobre eles.

**Como são usados aqui:** `src/composables/useAR.js` é um *composable* (função reutilizável do Vue 3) que:
1. Carrega Three.js e MindAR dinamicamente do CDN (apenas quando necessário)
2. Inicializa `MindARThree` com o arquivo `markers.mind` (arquivo compilado com as imagens dos marcadores)
3. Expõe `start()`, `stop()`, `addAnchor()` para as views usarem

**ScanView** usa `useAR` com `maxTrack=1` (rastreia 1 marcador) e dispara `store.discover()` quando o marcador é detectado.

**CaptureView** usa `useAR` com `maxTrack=2` (rastreia 2 marcadores simultaneamente) e dispara `store.capture()` apenas quando o par correto de marcadores está visível ao mesmo tempo.

---

### Estrutura de Arquivos do Frontend

```
src/
├── main.js                  ← ponto de entrada (monta o app Vue)
├── App.vue                  ← componente raiz (contém o <RouterView>)
├── style.css                ← CSS global (variáveis, reset)
├── router/
│   └── index.js             ← definição de rotas e guards de navegação
├── stores/
│   ├── auth.js              ← estado de autenticação (token, usuário)
│   ├── professors.js        ← lista de professores com descoberta/captura
│   └── counter.js           ← store de exemplo (ignorar)
├── services/
│   └── api.js               ← instância Axios configurada com interceptor JWT
├── composables/
│   └── useAR.js             ← lógica de AR (MindAR + Three.js), reutilizável
├── components/
│   └── ProfCard.vue         ← card de professor para o ProfDex
└── views/
    ├── HomeView.vue         ← tela inicial (landing)
    ├── LoginView.vue        ← formulário de login
    ├── RegisterView.vue     ← formulário de cadastro
    ├── ProfdexView.vue      ← galeria de professores do usuário
    ├── ScanView.vue         ← scanner AR (descobre professores)
    └── CaptureView.vue      ← captura AR (dois marcadores simultâneos)
```

---

## Backend — `profdex-back/`

### Tecnologias

#### NestJS
**O que é:** Framework Node.js para construir APIs REST escaláveis. Fortemente inspirado no Angular — usa decoradores TypeScript (`@Controller`, `@Injectable`, `@Module`) para organizar o código em módulos reutilizáveis.

**Como é usado aqui:** A API tem 5 módulos:

| Módulo | Responsabilidade |
|--------|-----------------|
| `AuthModule` | Login, registro, emissão de JWT |
| `UsersModule` | CRUD de usuários (usado internamente pelo Auth) |
| `ProfessorsModule` | Listagem de professores com status por usuário |
| `DiscoveriesModule` | Registrar quando um aluno descobre um professor |
| `CapturesModule` | Registrar quando um aluno captura um professor |

**Padrão NestJS (entender é fundamental):**
- **Module** (`*.module.ts`) — agrupa providers e controllers relacionados
- **Controller** (`*.controller.ts`) — define as rotas HTTP e delega para o service
- **Service** (`*.service.ts`) — contém a lógica de negócio e acessa o banco via Prisma
- **DTO** (`dto/*.dto.ts`) — define a forma dos dados de entrada (validados automaticamente)
- **Guard** (`guards/*.guard.ts`) — middleware de autorização (verifica o JWT)

#### TypeScript
**O que é:** JavaScript com tipagem estática. Detecta erros em tempo de compilação que JavaScript só mostraria em produção.

**Como é usado aqui:** Todo o backend é TypeScript. Os arquivos `.ts` são compilados para `.js` pelo `tsc` antes de rodar. Em dev, o `ts-node` executa TypeScript diretamente.

**Por que importa:** Os DTOs usam decoradores do `class-validator` que só funcionam com TypeScript + `reflect-metadata`. Não tente portar para JS sem reescrever a validação.

#### Prisma
**O que é:** ORM (Object-Relational Mapper) moderno para Node.js. Em vez de escrever SQL diretamente, você define os modelos em `prisma/schema.prisma` e o Prisma gera um cliente TypeScript tipado para interagir com o banco.

**Como é usado aqui:** `src/prisma/prisma.service.ts` estende `PrismaClient` e é injetado nos services que precisam de banco. O schema define 4 modelos:

```
User         ← aluno (matrícula, nome, senha hash)
Professor    ← professor (nome, slug, índices dos markers)
Discovery    ← aluno descobriu professor (userId + professorId, único por par)
Capture      ← aluno capturou professor (requer Discovery prévia, único por par)
```

**Comandos importantes:**
```bash
npm run db:migrate   # aplica migrações ao banco
npm run db:seed      # popula com dados iniciais (professores)
npm run db:studio    # abre interface visual do banco no browser
```

#### PostgreSQL
**O que é:** Banco de dados relacional open-source. Os dados são organizados em tabelas com relacionamentos.

**Como é usado aqui:** Banco principal da aplicação. Configurado via variável de ambiente `DATABASE_URL` no `.env`. Prisma gerencia as migrações (arquivos em `prisma/migrations/`).

#### JWT (JSON Web Token) + Passport
**O que são:**
- **JWT** — padrão para tokens de autenticação. O backend assina um token com dados do usuário; o frontend envia esse token em toda requisição. O backend valida a assinatura sem precisar consultar o banco.
- **Passport** — middleware de autenticação para Node.js. O NestJS tem integração via `@nestjs/passport`.

**Como é usado aqui:**
- `AuthService.login()` / `AuthService.register()` retornam `{ access_token, user }`
- `JwtStrategy` (`auth/strategies/jwt.strategy.ts`) extrai e valida o token do header
- `JwtAuthGuard` (`auth/guards/jwt-auth.guard.ts`) é aplicado com `@UseGuards(JwtAuthGuard)` em qualquer controller que exige autenticação
- O payload do JWT contém `{ sub: userId, matricula, name }`

#### bcryptjs
**O que é:** Biblioteca para hash seguro de senhas. Nunca armazena senha em texto puro — aplica um algoritmo one-way com salt aleatório.

**Como é usado aqui:** `AuthService.register()` faz hash da senha antes de salvar. `AuthService.login()` compara a senha enviada com o hash no banco via `bcrypt.compare()`.

#### class-validator + class-transformer
**O que são:** Bibliotecas para validar e transformar objetos JavaScript/TypeScript.

**Como são usados aqui:** Os DTOs usam decoradores para validar automaticamente os dados de entrada:
```typescript
// auth/dto/register.dto.ts
export class RegisterDto {
  @IsString() matricula: string
  @IsString() name: string
  @IsString() @MinLength(6) password: string
}
```
O NestJS aplica o `ValidationPipe` globalmente e rejeita com 400 Bad Request se a validação falhar.

---

### Estrutura de Arquivos do Backend

```
src/
├── main.ts                         ← ponto de entrada (cria o app NestJS)
├── app.module.ts                   ← módulo raiz (importa todos os outros)
├── app.controller.ts               ← rota GET / (health check)
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts          ← POST /auth/login, POST /auth/register
│   ├── auth.service.ts             ← lógica de login/register + emissão JWT
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts       ← protege rotas que exigem JWT
│   └── strategies/
│       └── jwt.strategy.ts         ← valida o token e extrai o usuário
├── users/
│   ├── users.module.ts
│   └── users.service.ts            ← findByMatricula(), create()
├── professors/
│   ├── professors.module.ts
│   ├── professors.controller.ts    ← GET /professors, GET /professors/:id
│   └── professors.service.ts       ← lista com status discovered/captured por usuário
├── discoveries/
│   ├── discoveries.module.ts
│   ├── discoveries.controller.ts   ← POST /discoveries, GET /discoveries
│   ├── discoveries.service.ts      ← cria ou ignora (upsert) descoberta
│   └── dto/create-discovery.dto.ts
├── captures/
│   ├── captures.module.ts
│   ├── captures.controller.ts      ← POST /captures, GET /captures
│   ├── captures.service.ts         ← valida discovery prévia, cria captura
│   └── dto/create-capture.dto.ts
└── prisma/
    ├── prisma.module.ts            ← PrismaModule exportável globalmente
    └── prisma.service.ts           ← PrismaClient como serviço NestJS injetável

prisma/
├── schema.prisma                   ← definição dos modelos (fonte da verdade do banco)
├── seed.ts                         ← popula banco com professores iniciais
└── migrations/                     ← histórico de migrações SQL geradas pelo Prisma
```

---

## Rotas da API

Todas as rotas (exceto `/auth/*`) exigem o header:
```
Authorization: Bearer <token>
```

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/api/auth/register` | Não | Cadastrar aluno (retorna token) |
| POST | `/api/auth/login` | Não | Login (retorna token) |
| GET | `/api/professors` | Sim | Lista professores com `discovered` e `captured` do usuário |
| GET | `/api/professors/:id` | Sim | Detalhes de um professor |
| POST | `/api/discoveries` | Sim | Registrar descoberta `{ professorId }` |
| GET | `/api/discoveries` | Sim | Listar descobertas do usuário |
| POST | `/api/captures` | Sim | Registrar captura `{ professorId }` (exige discovery prévia) |
| GET | `/api/captures` | Sim | Listar capturas do usuário |

---

## Modelo de Dados

```
User
  id          UUID (PK)
  matricula   String (único)
  name        String
  password    String (bcrypt hash)
  createdAt   DateTime

Professor
  id           UUID (PK)
  name         String
  slug         String (único) ← usado para buscar a imagem /professors/{slug}-cartoon.png
  modelUrl     String?        ← URL do modelo 3D (opcional, para AR)
  marker1Index Int            ← índice do 1º marcador no arquivo markers.mind
  marker2Index Int            ← índice do 2º marcador no arquivo markers.mind

Discovery
  id           UUID (PK)
  userId       FK → User
  professorId  FK → Professor
  discoveredAt DateTime
  [unique: userId + professorId]

Capture
  id          UUID (PK)
  userId      FK → User
  professorId FK → Professor
  capturedAt  DateTime
  [unique: userId + professorId]
  [regra: Discovery deve existir antes de Capture]
```

---

## Fluxo de Descoberta e Captura

```
DESCOBERTA (ScanView)
  Usuário aponta câmera → MindAR detecta marker1Index do professor
  → frontend chama POST /discoveries { professorId }
  → backend faz upsert (não falha se já descoberto)
  → professor aparece desfocado no ProfDex com "?"

CAPTURA (CaptureView)
  Usuário posiciona dois marcadores → MindAR detecta marker1Index E marker2Index simultaneamente
  → frontend chama POST /captures { professorId }
  → backend verifica se Discovery existe (400 se não)
  → backend faz upsert da Capture
  → professor aparece desbloqueado no ProfDex com foto e nome
```

---

## Configuração e Execução

### Backend (`profdex-back/`)
```bash
cp .env.example .env          # configurar DATABASE_URL e JWT_SECRET
npm install
npm run db:migrate            # criar tabelas
npm run db:seed               # popular professores
npm run start:dev             # iniciar em modo desenvolvimento (watch)
```

### Frontend (`profdex/`)
```bash
cp .env.example .env          # configurar VITE_API_URL
npm install
npm run dev                   # iniciar servidor de desenvolvimento
```

O arquivo `public/markers.mind` deve existir (gerado pelo MindAR Image Targets Compiler com as imagens dos marcadores). As imagens dos professores ficam em `public/professors/{slug}-cartoon.png`.
