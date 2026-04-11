# Redesign: Landing com Catálogo, Preview Gratuito e Paywall no Reader

**Data:** 2026-04-11  
**Scope:** Reposicionar a landing da Vivências Azuis como catálogo institucional e introduzir preview gratuito com trava parcial dentro do reader.

---

## Problema

A home atual ainda tem dinâmica de produto em destaque e leva o usuário para páginas intermediárias de produto. Isso não apresenta a Vivências Azuis como uma biblioteca de cursos disponíveis.

O fluxo de acesso também é binário demais:

- usuário sem compra ativa é redirecionado para a página de vendas
- usuário com compra ativa acessa o reader completo

O pedido é transformar esse caminho em um funil mais direto:

- a landing deve apresentar a marca e listar todos os cursos ativos
- o clique no curso deve levar para login
- após login, o usuário deve entrar direto na leitura
- o primeiro capítulo deve ficar liberado como amostra
- os demais capítulos devem aparecer bloqueados com sombreado e cadeado
- ao fim da leitura do primeiro capítulo, deve abrir um popup com mensagem de continuidade e link para pagamento no Stripe

---

## Design aprovado

### 1. Landing (`src/app/page.tsx`, `src/components/marketing/catalog-landing.tsx`)

**Objetivo:** apresentar a Vivências Azuis e expor imediatamente os cursos ativos.

**Mudanças:**

- Manter a home como página institucional da marca
- Reorientar a hero para apresentar a proposta da Vivências Azuis, não apenas um produto destaque
- Mostrar a listagem dos cursos disponíveis como parte principal da página
- Cada card de curso terá um único CTA: `Entrar para começar`
- O CTA deve apontar para login com redirecionamento posterior para o reader do curso
  - formato esperado: `/login?next=/products/[slug]/read`

**Não haverá:**

- CTA secundário de detalhes
- dependência de página intermediária de vendas para iniciar o funil principal

---

### 2. Fluxo de autenticação

**Objetivo:** reduzir atrito entre descoberta do curso e início da experiência.

**Comportamento:**

- Usuário clica em `Entrar para começar` na landing
- Vai para `/login?next=/products/[slug]/read`
- Após login bem-sucedido, cai direto no reader do curso

**Observação:** o login passa a ser uma etapa obrigatória antes da leitura, mas não antes da descoberta dos cursos.

---

### 3. Reader com preview (`src/app/products/[slug]/read/page.tsx` e componentes do reader)

**Objetivo:** permitir leitura gratuita do capítulo 1 sem duplicar a estrutura do reader.

**Estratégia aprovada:** reaproveitar o reader atual com um modo derivado de preview.

**Regra central:**

- `isPreviewMode = !canAccessProduct(entitlement)`

**Comportamento no modo preview:**

- Usuário entra no reader normalmente, sem redirecionamento para página de produto
- Apenas o capítulo 1 fica liberado
- O sumário mostra os capítulos seguintes, mas em estado bloqueado
- Itens bloqueados devem receber:
  - sombreado visual
  - cadeado
  - desativação de clique/navegação
- A navegação inferior e a paginação só podem avançar dentro da área liberada

**Comportamento no modo premium:**

- Se `canAccessProduct(entitlement)` for verdadeiro, tudo permanece liberado como hoje

---

### 4. Paywall no fim do capítulo 1

**Objetivo:** converter o fim da amostra em convite direto para compra.

**Comportamento:**

- Quando o usuário alcançar o último slide liberado do capítulo 1, abrir um popup
- O popup informa que a amostra terminou e que o restante do curso é liberado após o pagamento
- CTA principal leva para o checkout Stripe do produto
- Ação secundária fecha o popup e mantém o usuário no preview

**Integração com Stripe:**

- Reaproveitar `POST /api/checkout`
- Enviar `productId` via formulário, como o fluxo atual já faz
- Não criar integração paralela ou nova rota de cobrança

---

## Arquitetura proposta

### Server side

- O reader continua sendo carregado na rota atual `src/app/products/[slug]/read/page.tsx`
- A página deixa de redirecionar usuários sem entitlement ativo para `/products/[slug]`
- A página calcula:
  - `isPreviewMode`
  - capítulos completos publicados
  - páginas completas do reader
  - subconjunto liberado para preview

### Client side

- Um componente client do reader controla a abertura do popup de paywall
- O disparo ocorre ao detectar que o usuário está no último slide liberado do preview
- O sumário client recebe metadados para renderizar:
  - item ativo
  - item concluído
  - item bloqueado

---

## Dados e regras de acesso

### Cursos exibidos na landing

- Continuar usando `getPublishedProducts()`
- Exibir todos os produtos com `status = published`

### Preview liberado

- O preview inclui somente o primeiro capítulo publicado do curso
- Se o primeiro capítulo tiver múltiplos blocos/slides, todos eles ficam liberados
- Todo conteúdo após esse capítulo entra em estado bloqueado

### Checkout

- O pagamento continua liberando acesso integral via entitlement ativo
- Após sucesso no Stripe, o retorno padrão continua para `/library?checkout=processing`

---

## Arquivos a modificar

| Arquivo | Mudança |
| --- | --- |
| `src/components/marketing/catalog-landing.tsx` | Reposicionar a landing para apresentar a Vivências Azuis e listar cursos com CTA único para login |
| `src/app/page.tsx` | Continua servindo a landing, sem mudança estrutural relevante |
| `src/app/products/[slug]/read/page.tsx` | Remover redirect para não pagantes, calcular preview liberado e passar estado de bloqueio |
| `src/features/reader/reader-sidebar.tsx` | Mostrar capítulos bloqueados com cadeado e sombreado |
| `src/features/reader/*` | Possível componente client para popup/paywall e navegação de preview |
| `tests/marketing-landing.test.tsx` | Atualizar expectativa da home/catalog |
| `tests/product-read-page.test.tsx` | Cobrir modo preview, bloqueio e CTA de cobrança |

---

## Não muda

- `src/app/api/checkout/route.ts` permanece como endpoint de criação da sessão Stripe
- `src/domains/orders/access.ts` continua sendo a fonte de verdade para acesso premium
- fluxo de webhook e ativação de entitlement não precisa ser refeito
- biblioteca do usuário continua sendo o destino pós-checkout

---

## Riscos e cuidados

- O preview não pode permitir navegação por querystring para páginas bloqueadas
- O sumário não pode sugerir acesso clicável aos capítulos travados
- O popup deve abrir apenas no fim do preview, não em qualquer página do capítulo 1
- O modo preview não pode quebrar o comportamento premium existente
- O CTA da landing deve preservar corretamente o `next` para o reader do curso certo

---

## Critérios de sucesso

- A home apresenta a Vivências Azuis e lista todos os cursos ativos
- Cada curso mostra apenas `Entrar para começar`
- O login redireciona para o reader do curso escolhido
- Usuário sem compra ativa consegue ler apenas o capítulo 1
- Capítulos restantes aparecem bloqueados com cadeado e sombreado
- Ao final do capítulo 1, o popup de cobrança aparece com CTA para Stripe
- Usuário com compra ativa continua acessando todo o conteúdo sem regressão
