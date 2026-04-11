# Redesign: Login, Biblioteca e Reader

**Data:** 2026-04-11  
**Scope:** Três áreas da aplicação Vivências Azuis com design inconsistente

---

## Problema

Três páginas usam um design system diferente do restante da aplicação:

- `src/app/login/page.tsx` — cores `zinc` genéricas do Tailwind, texto em inglês ("Sign in", "New here?", "Password"), visual desconectado da marca
- `src/app/library/page.tsx` — cores `zinc`, sem `va-*` tokens, botões `zinc-950`
- `src/app/products/[slug]/read/page.tsx` — estrutura correta com `va-*`, mas sidebar sem opção de recolher e capítulos não agrupados

O restante da aplicação (catalog landing, reader panel, produto) já usa o design system `va-*` definido em `src/app/globals.css`.

---

## Design aprovado

### 1. Login (`src/app/login/page.tsx`)

**Layout:** Split screen em duas colunas de 50% cada.

**Coluna esquerda (dark):**
- Fundo: `linear-gradient(160deg, var(--va-blue-800), var(--va-navy))`
- Radial sutil no canto superior esquerdo com `rgba(122,180,227,0.08)`
- Topo: label "Vivências Azuis" em `var(--va-blue-300)`, uppercase, tracking largo
- Título serif: "Guias para famílias em jornada autista"
- Subtítulo em `rgba(255,255,255,0.72)`
- Chips com `va-chip va-chip-on-dark` no rodapé da coluna

**Coluna direita (formulário):**
- Fundo: `va-page` (warm sand)
- Label "Conta" em `var(--va-blue)`, uppercase
- Título "Entrar" em serif `var(--va-navy)`
- Subtítulo em `var(--va-soft-ink)`
- Campos com fundo branco, border `var(--va-line)`, border-radius `0.75rem`, sombra sutil
- Labels "Email" e "Senha" (português)
- Botão primário: gradiente `var(--va-blue-700)` → `var(--va-navy)`, `border-radius: 999px`, texto "Entrar na conta"
- Link rodapé: "Ainda não tem conta? Criar conta" com `var(--va-blue-700)`

**Mobile:** as colunas empilham, dark no topo (compacto), formulário abaixo.

**Registro (`src/app/register/page.tsx`):** Mesmo template do login, texto "Criar conta" no título, link "Já tem conta? Entrar".

---

### 2. Biblioteca (`src/app/library/page.tsx`)

**Fundo:** `va-page` (radial-gradient azul sutil + sand)

**Header nav:** pill com `va-reader-bar` (igual ao reader) — "Vivências Azuis" à esquerda, "Sair" à direita.

**Hero:**
- Label "Biblioteca" em `var(--va-blue)`, uppercase
- Título "Seus guias" em serif `var(--va-navy)`, `text-4xl`
- Subtítulo em `var(--va-soft-ink)`

**Cards de produto:** usar classe `va-panel` existente.
- Label "Guia digital" em `var(--va-muted)`, uppercase
- Título do produto em serif `var(--va-navy)`
- Barra de progresso: `h-2`, track branco, fill `linear-gradient(90deg, var(--va-blue-300), var(--va-blue))`
- Texto "X% concluído" em `var(--va-muted)`
- Botão "Continuar leitura" / "Ler agora": gradiente `var(--va-blue-700)` → `var(--va-navy)`, pill

**Estado vazio:** card com border dashed `var(--va-line-strong)`, fundo `var(--va-paper)`, texto "Você ainda não tem guias liberados."

**Mensagem de checkout:** manter estilo emerald atual (funciona bem).

---

### 3. Reader (`src/app/products/[slug]/read/page.tsx`)

**Sidebar recolhível:**

- Estado padrão: **aberta** (300px)
- Botão toggle no topo da sidebar: ícone `◀` para recolher, `▶` para expandir
  - Estilo: `w-7 h-7`, fundo `var(--va-paper)`, border `var(--va-line)`, `border-radius: 0.5rem`
- Quando recolhida: sidebar vira `w-10` (40px), mostra apenas o botão toggle + dots de progresso + percentual rotacionado
- Estado persiste via `useState` no cliente (não precisa de URL/cookie)
- Conteúdo ganha largura extra quando sidebar recolhida

**Agrupamento por capítulo no sumário:**
- Cada grupo de capítulo tem label acima: "Cap. N" em `0.42rem`, uppercase, `var(--va-muted)`
- Itens do capítulo listados abaixo sem separação excessiva
- Item ativo: border `var(--va-blue-300)`, fundo branco
- Item concluído: ícone `✓` em `var(--va-blue)` à direita
- Sem "Página X" como label duplicado — mostrar diretamente o título do bloco ou título do capítulo

**Tipografia do conteúdo:**
- Corpo de texto: `font-family: serif`, `text-[1.05rem]`, `leading-[1.9]` (mais espaçado que atual)
- Parágrafos com `space-y-6` (era `space-y-5`)

**Componente:** A sidebar precisa ser um Client Component para o toggle funcionar. Extrair `<ReaderSidebar>` com `"use client"` da page atual (que é Server Component).

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `src/app/login/page.tsx` | Redesign completo — split screen |
| `src/app/register/page.tsx` | Mesmo template do login |
| `src/app/library/page.tsx` | va-* tokens + layout hero + cards melhorados |
| `src/app/products/[slug]/read/page.tsx` | Sidebar recolhível + agrupamento por capítulo |
| `src/features/reader/reader-sidebar.tsx` | Novo Client Component extraído da page |

---

## Não muda

- `src/app/globals.css` — design tokens `va-*` já estão corretos, nenhuma adição necessária
- `src/components/auth/auth-form.tsx` — lógica do formulário intocada, apenas o wrapper muda
- `src/features/reader/block-renderer.tsx` — só o `leading` dos parágrafos muda (via CSS class na page)
- Lógica de progresso, sessão, acesso — sem alterações
