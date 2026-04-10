# Course Import Design: Guia Prático Primeiros 30 Dias

Date: 2026-04-10

## Goal

Cadastrar o curso descrito em `Guia Prático Primeiros 30 Dias Após o Diagnóstico-2026-04-10.md` diretamente na estrutura atual da aplicação, deixando-o publicado, legível no reader, vendável no checkout e liberado para um usuário de teste com entitlement ativo.

## Scope

Incluído neste trabalho:

- Criar um fluxo idempotente de importação específico para este curso.
- Persistir `product`, `chapters` e `content_blocks` no banco atual.
- Criar um usuário de teste dedicado, se necessário.
- Criar um entitlement ativo para esse usuário no curso importado.
- Representar entregáveis extras do material como blocos `download` placeholder.
- Cobrir a importação com testes automatizados.

Fora de escopo:

- Importador Markdown genérico para qualquer curso.
- Upload real e gestão de assets.
- CMS completo para editar landing page estruturada.
- Migração do texto da landing pública para um modelo editorial novo.

## Source Mapping

O arquivo Markdown será tratado como fonte única para este curso.

Mapeamento proposto:

- Título, descrição curta, preço sugerido e promessa principal alimentam o `product`.
- Seções principais do conteúdo viram `chapters`.
- Texto corrido vira blocos `rich_text`.
- Trechos de destaque operacional podem virar `callout` quando ajudarem a leitura.
- Listas de ação explícitas viram `checklist` quando houver itens concretos e marcáveis.
- Entregáveis extras citados no documento viram blocos `download` com `assetId` placeholder.

## Product Shape

O produto será criado como:

- `status: published`
- preço `6700`
- moeda `brl`
- slug estável derivado do guia
- copy base suficiente para a página pública atual, que depende apenas dos campos de `products`

Como a landing atual é genérica e não usa um modelo de seções customizadas, a importação vai preencher bem os campos existentes, sem tentar representar toda a VSL/copy longa do documento.

## Import Strategy

A implementação será um seed/import script idempotente, orientado por IDs estáveis.

Estratégia:

- Definir IDs estáveis para produto, capítulos e blocos.
- Fazer upsert ou atualização explícita por IDs conhecidos.
- Reexecutar sem duplicar registros.
- Separar parsing do Markdown da persistência para facilitar teste.

Estrutura sugerida:

- Helper puro que lê o Markdown e retorna uma estrutura intermediária do curso.
- Helper de persistência que grava produto, capítulos e blocos.
- Extensão do seed atual para registrar também usuário de teste e entitlement.

## Test User And Access

Será criado um usuário de teste dedicado para não misturar acesso com contas já existentes.

Comportamento:

- Se o usuário já existir, reutilizar.
- Se não existir, criar.
- Garantir entitlement ativo para o produto importado.

O objetivo é permitir validar imediatamente `/library` e `/products/[slug]/read` com esse usuário.

## Validation

Cobertura mínima:

- teste para o parser do Markdown gerar estrutura esperada
- teste para validar payloads dos blocos gerados
- teste para garantir comportamento idempotente da importação
- teste para garantir criação do entitlement do usuário de teste

Verificação manual final:

- rodar o seed/import
- confirmar o produto publicado no banco
- confirmar capítulos e blocos
- confirmar usuário de teste e entitlement ativo
- rodar `npm test`, `npm run lint` e `npm run build`

## Risks And Decisions

Decisões assumidas:

- Este trabalho é específico para este curso, não um framework genérico de importação.
- Blocos `download` usarão placeholders até existir asset management real.
- A estrutura do Markdown será interpretada de forma pragmática; onde não houver sinal claro para checklist/callout, o conteúdo ficará como `rich_text`.

Risco principal:

- O documento mistura copy de produto e conteúdo editorial. Para reduzir ambiguidade, a importação vai priorizar fidelidade no reader e usar apenas o mínimo necessário da copy na página pública atual.
