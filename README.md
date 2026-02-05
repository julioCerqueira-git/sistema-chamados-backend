# Sistema de Chamados - Backend

Backend para o trabalho de Internet II, desenvolvido com NestJS, TypeORM e PostgreSQL.

## Sobre a Aplicação
- API de gestão de chamados (tickets) com autenticação JWT.
- Permite cadastrar usuários, realizar login e criar/listar/detalhar/atualizar/excluir tickets.
- Regras de acesso:
  - Atualização de ticket: dono do ticket ou administrador.
  - Exclusão de ticket: apenas administrador.
- Administração por e-mail via `ADMIN_EMAILS` no `.env` (emite token com `role=admin` no login).
- Validação forte de payloads com `ValidationPipe` e `class-validator`.
- Documentação interativa via Swagger em `/api`.

## Arquitetura e Estrutura de Pastas

### Motivo da Escolha da Arquitetura
- Modular por funcionalidade (Auth, Users, Tickets): facilita manutenção, evolução e isolamento de responsabilidades.
- Injeção de dependências do NestJS (DI): torna serviços fáceis de testar e trocar implementações.
- Segurança e controle de acesso com Guards/Strategies: JWT + RBAC simples e claro (admin/user).
- Validação nativa com Pipes e DTOs: entradas consistentes e proteção contra payloads inválidos.
- Persistência com TypeORM + PostgreSQL: entidades tipadas, migrations versionadas e consultas robustas.
- Documentação com Swagger: visibilidade imediata das rotas e modelos, útil para integração.
- Tipos centralizados em `src/types`: elimina `any`, melhora autocompletar e reduz erros em tempo de compilação.

### Árvore de Pastas
```
.
├─ .env.example
├─ README.md
├─ package.json
├─ tsconfig.json
├─ tsconfig.build.json
├─ logs
│  └─ app.log
└─ src
   ├─ auth
   │  ├─ dto
   │  │  └─ login.dto.ts
   │  ├─ admin.guard.ts
   │  ├─ auth.controller.ts
   │  ├─ auth.module.ts
   │  ├─ auth.service.ts
   │  ├─ jwt-auth.guard.ts
   │  └─ jwt.strategy.ts
   ├─ common
   │  ├─ filters
   │  │  └─ all-exceptions.filter.ts
   │  └─ middlewares
   │     └─ logger.middleware.ts
   ├─ migrations
   │  ├─ 1769958600000-InitialCreate.ts
   │  ├─ 1769964700000-AddUserRole.ts
   │  └─ 1769965000000-DropComments.ts
   ├─ tickets
   │  ├─ dto
   │  │  ├─ create-ticket.dto.ts
   │  │  └─ update-ticket.dto.ts
   │  ├─ ticket.entity.ts
   │  ├─ tickets.controller.ts
   │  ├─ tickets.module.ts
   │  └─ tickets.service.ts
   ├─ types
   │  ├─ auth.ts
   │  └─ bcrypt.d.ts
   ├─ users
   │  ├─ dto
   │  │  └─ create-user.dto.ts
   │  ├─ user.entity.ts
   │  ├─ users.controller.ts
   │  ├─ users.module.ts
   │  └─ users.service.ts
   ├─ utils
   │  └─ env.ts
   ├─ app.module.ts
   ├─ data-source.ts
   └─ main.ts
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) instalado e rodando

## Configuração Passo-a-Passo

### 1. Banco de Dados

Crie um banco de dados no PostgreSQL chamado `sistemachamadosbackend` (ou outro nome de sua preferência):

```sql
CREATE DATABASE sistemachamadosbackend;
```

### 2. Variáveis de Ambiente

Duplique o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
# ou no Windows: copy .env.example .env
```

Edite o arquivo `.env` com suas credenciais do banco:

```ini
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario_postgres
DB_PASS=sua_senha_postgres
DB_NAME=sistemachamadosbackend
JWT_SECRET=sua_chave_secreta_super_segura
PORT=3000
# (Opcional) Lista de e-mails com permissão de ADMIN (separados por vírgula)
ADMIN_EMAILS=admin@exemplo.com,outro.admin@exemplo.com
```

### 3. Instalação

Instale as dependências do projeto:

```bash
npm install
```

### 4. Migrations

Compile e execute as migrations para criar as tabelas no banco de dados:

```bash
npm run build
npm run migration:run
```

### 5. Executar

Inicie o servidor em modo de desenvolvimento:

```bash
npm run start:dev
```

O servidor estará rodando em `http://localhost:3000`.
A documentação Swagger estará disponível em `http://localhost:3000/api`.

## Testando com Postman (ou Swagger)

### Autenticação

1.  **Registrar Usuário**
    *   **Método:** `POST`
    *   **URL:** `http://localhost:3000/auth/register`
    *   **Body (JSON):**
        ```json
        {
          "name": "Usuário Teste",
          "email": "teste@email.com",
          "password": "senha123"
        }
        ```

2.  **Login**
    *   **Método:** `POST`
    *   **URL:** `http://localhost:3000/auth/login`
    *   **Body (JSON):**
        ```json
        {
          "email": "teste@email.com",
          "password": "senha123"
        }
        ```
    *   **Resposta:** Copie o `access_token` retornado.
    *   **Verificar usuário logado (role incluída):**
        *   **Método:** `GET`
        *   **URL:** `http://localhost:3000/auth/me`
        *   **Header:** `Authorization: Bearer <SEU_TOKEN>`
        *   **Resposta esperada:**
          ```json
          {
            "userId": "uuid",
            "username": "teste@email.com",
            "role": "user"
          }
          ```
        *   Se seu e-mail estiver em `ADMIN_EMAILS`, a `role` será `"admin"`.

### Tickets (Requer Token)

Para as rotas abaixo, adicione o header de autorização:
*   **Authorization:** `Bearer <SEU_TOKEN_AQUI>`

3.  **Criar Ticket**
    *   **Método:** `POST`
    *   **URL:** `http://localhost:3000/tickets`
    *   **Body (JSON):**
        ```json
        {
          "title": "Erro no sistema",
          "description": "Não consigo acessar a página de login"
        }
        ```

4.  **Listar Tickets**
    *   **Método:** `GET`
    *   **URL:** `http://localhost:3000/tickets`
    *   **Comportamento:**
        - Usuário comum: retorna apenas seus próprios tickets.
        - Admin: retorna todos os tickets do sistema.

5.  **Ver Detalhes do Ticket**
    *   **Método:** `GET`
    *   **URL:** `http://localhost:3000/tickets/{id-do-ticket}`

6.  **Atualizar Ticket (dono ou admin)**
    *   **Método:** `PUT`
    *   **URL:** `http://localhost:3000/tickets/{id-do-ticket}`
    *   **Body (JSON):**
      ```json
      {
        "title": "Novo título",
        "description": "Nova descrição"
      }
      ```

7.  **Deletar Ticket (apenas admin)**
    *   **Método:** `DELETE`
    *   **URL:** `http://localhost:3000/tickets/{id-do-ticket}`
    *   **Header:** `Authorization: Bearer <TOKEN_COM_ROLE_ADMIN>`

## Explicações Importantes
- Autenticação:
  - O login retorna um `access_token` JWT. Informe-o no header `Authorization: Bearer <token>`.
  - A rota `GET /auth/me` retorna o usuário autenticado e sua `role`.
- Papéis (roles):
  - Admin é configurado via `ADMIN_EMAILS` no `.env`. Faça login com o e-mail listado para emitir token com `role=admin`.
  - Listagem: usuário vê apenas seus tickets; admin vê todos.
  - PUT de ticket: dono ou admin. DELETE de ticket: somente admin.
- Validação:
  - `ValidationPipe` com `whitelist` e `forbidNonWhitelisted` rejeita campos desconhecidos.
  - DTOs definem formatos válidos (ex.: `email` válido, `password` com mínimo de 6 caracteres).
- Erros:
  - Filtro global (`AllExceptionsFilter`) retorna JSON com `statusCode`, `timestamp`, `path` e `message`.
  - Erros comuns: `400` (payload inválido), `401` (token ausente/ inválido), `403` (sem permissão), `404` (recurso não encontrado).
- Build vs Start:
  - `npm run start` usa arquivos de `dist`. Após mudanças em `src`, rode `npm run build`.
  - Em desenvolvimento, use `npm run start:dev` (recompila automaticamente).
- Migrations:
  - O comando lê `dist/data-source.js`. Por isso: `npm run build` antes de `npm run migration:run`.
- Ambiente:
  - Após alterar `.env`, reinicie o servidor para carregar as novas variáveis.

## Swagger
- Abra `http://localhost:3000/api`
- Clique em “Authorize” e informe o Bearer token para testar rotas protegidas
- Todas as rotas aparecem agrupadas por controlador (Auth, Users, Tickets)

## Dicas e Solução de Problemas
- 400 Bad Request ao enviar body:
  - O projeto usa `ValidationPipe` com `whitelist` e `forbidNonWhitelisted`. Envie somente campos válidos conforme os DTOs (name, email, password para usuário; title, description para ticket).
- 403 Forbidden em rotas protegidas:
  - Verifique se o token é recente e se contém a role correta via `GET /auth/me`.
  - Para ser admin, inclua seu e-mail em `ADMIN_EMAILS` no `.env`, reinicie o servidor e faça login novamente para emitir novo token.
- Variáveis do .env não aplicaram:
  - Reinicie o servidor após alterar `.env`.
- Migrations deram erro:
  - Rode `npm run build` antes de `npm run migration:run` (o CLI lê `dist/data-source.js`).

## Reset do Banco (Dev)
Se precisar limpar tudo:
```sql
DROP TABLE "comments";
DROP TABLE "tickets";
DROP TABLE "users";
```
Depois rode:
```bash
npm run build
npm run migration:run
```

## Testes Automatizados
- Framework: Jest com ts-jest para TypeScript.
- Local dos testes: pasta `test/` com arquivos `.spec.ts` (AuthService, UsersService, TicketsService, AuthController, UsersController, TicketsController).
- Cobertura: relatórios em `coverage/` (text, lcov, json, html).

### Executar Testes
- Testes unitários:

```bash
npm run test
```

- Testes com cobertura:

```bash
npm run test:coverage
```

- Relatório HTML:
  - Abra `coverage/lcov-report/index.html` no navegador para visualizar arquivos e percentuais.

### O que é coberto
- AuthService: valida credenciais e emissão de token com role (admin/user) — ver auth.service.spec.ts
- UsersService: criação com hash de senha e consultas — ver users.service.spec.ts
- TicketsService: CRUD principal, exceções e relacionamentos básicos — ver tickets.service.spec.ts
- AuthController: register/login/me e respostas/erros — ver auth.controller.spec.ts
- UsersController: criação de usuário — ver users.controller.spec.ts
- TicketsController: CRUD, checagem de dono/admin e erros — ver tickets.controller.spec.ts

### Configuração
- Arquivo de configuração do Jest: [jest.config.js](sistema-chamados-backend/jest.config.js).
- Scripts:
  - [package.json](sistema-chamados-backend/package.json) contém `test` e `test:coverage`.
