# Vivencias Azuis Ebook

Aplicação Next.js para venda e leitura de infoprodutos digitais com autenticação, biblioteca do cliente, painel administrativo, persistência em libSQL/Turso e checkout via Stripe.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Drizzle ORM
- libSQL/Turso
- better-auth
- Stripe
- Vitest

## Requisitos

- Node.js 20+
- npm
- Banco libSQL/Turso configurado, ou uso do arquivo local `local.db`
- Conta Stripe para testar checkout e webhooks

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com base em `.env.example`.

```env
DATABASE_URL="file:local.db"
DATABASE_AUTH_TOKEN=""
BETTER_AUTH_SECRET="replace-with-a-strong-secret"
BETTER_AUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_replace"
STRIPE_WEBHOOK_SECRET="whsec_replace"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Notas:

- Se `DATABASE_URL` não for definido, a aplicação cai em `file:local.db`.
- `DATABASE_AUTH_TOKEN` só é necessário quando o banco estiver remoto.
- Em desenvolvimento, `BETTER_AUTH_URL` e `NEXT_PUBLIC_APP_URL` normalmente ficam em `http://localhost:3000`.
- O endpoint de webhook exige `STRIPE_WEBHOOK_SECRET`.

## Instalação

```bash
npm install
```

## Banco de dados

Gerar artefatos do Drizzle:

```bash
npm run db:generate
```

Aplicar migrações:

```bash
npm run db:migrate
```

Popular dados iniciais:

```bash
npm run db:seed
```

O seed cria um produto inicial publicado, um capítulo e um bloco de conteúdo para validar o fluxo da vitrine e do leitor.

## Rodando localmente

```bash
npm run dev
```

A aplicação sobe em `http://localhost:3000`.

Rotas úteis:

- `/`
- `/login`
- `/register`
- `/library`
- `/admin`
- `/products/guia-pratico-primeiros-30-dias`

## Stripe local

Para testar o fluxo de compra localmente:

1. Defina `STRIPE_SECRET_KEY` no `.env`.
2. Rode a aplicação com `npm run dev`.
3. Encaminhe eventos para o endpoint local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copie o `whsec_...` retornado pela Stripe CLI para `STRIPE_WEBHOOK_SECRET`.

O unlock de acesso deve acontecer pelo webhook `checkout.session.completed`, não pelo retorno do checkout no navegador.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Testes e verificação

Rodar testes:

```bash
npm run test
```

Rodar lint:

```bash
npm run lint
```

Gerar build de produção:

```bash
npm run build
```

## Estrutura principal

```txt
src/app
src/components
src/db
src/domains
src/features
tests
drizzle
```

Resumo:

- `src/app`: rotas, páginas e endpoints HTTP.
- `src/db`: cliente, schema e seed.
- `src/domains`: regras de negócio de auth, produtos, pedidos e admin.
- `src/features`: UI e comportamento do leitor.
- `src/components`: componentes compartilhados e formulários do admin.
- `tests`: cobertura unitária e integração.

## Fluxo técnico resumido

1. O usuário navega pela página pública de um produto.
2. Faz login ou cadastro.
3. A aplicação cria a sessão de checkout.
4. A Stripe envia o evento para `/api/stripe/webhook`.
5. O backend persiste pedido e entitlement.
6. O produto liberado aparece na biblioteca do usuário.
7. O conteúdo é consumido pelo leitor interno.

## Observações

- O projeto já contém migrações Drizzle versionadas em `drizzle/`.
- Existe um arquivo `local.db` no repositório para desenvolvimento local.
- `src/lib/auth.ts` usa um secret de fallback para desenvolvimento; em produção isso deve ser sempre definido por variável de ambiente.
