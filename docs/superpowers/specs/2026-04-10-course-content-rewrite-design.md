# Course Content Rewrite Design: Guia Pratico Primeiros 30 Dias

Date: 2026-04-10

## Goal

Reescrever o conteudo de `Guia Pratico: Primeiros 30 Dias Apos o Diagnostico` para que ele deixe de parecer uma promessa de venda rasa e passe a funcionar como um curso/e-book pratico, acolhedor e acionavel para familias nos primeiros dias apos um diagnostico ou suspeita de TEA.

O resultado esperado e um material que ajude a familia a reduzir sobrecarga, organizar prioridades, conversar melhor com profissionais e escola, e sair dos primeiros 30 dias com um plano simples para continuar.

## Editorial Direction

A direcao aprovada e uma reestruturacao forte do conteudo atual, sem transformar este trabalho em um produto premium completo.

O material deve:

- priorizar orientacao pratica em vez de copy de vendas;
- manter linguagem acolhedora, direta e respeitosa;
- evitar promessas terapeuticas, diagnosticas ou de resultado garantido;
- reconhecer que cada crianca e familia tem contexto proprio;
- reforcar que o guia nao substitui avaliacao, acompanhamento medico, terapeutico ou escolar;
- transformar secoes genericas em tarefas concretas, perguntas, modelos e checklists.

## Structure

O novo conteudo sera organizado como um percurso de 30 dias:

1. Boas-vindas e como usar o guia sem se sobrecarregar.
2. Primeiras 72 horas: o que fazer agora, o que evitar e como organizar a mente.
3. Semana 1: documentos, laudo, duvidas iniciais e rede imediata.
4. Semana 2: equipe profissional, terapias, criterios de escolha e alertas contra promessas milagrosas.
5. Semana 3: rotina, casa, comunicacao, escola e primeiros ajustes praticos.
6. Semana 4: registro de progresso, revisao de prioridades e plano dos proximos 60 dias.
7. Anexos praticos: checklists, perguntas, mensagens prontas e diario de acompanhamento.

O curso tambem deve oferecer uma opcao visivel para baixar o material completo em PDF. O download deve aparecer dentro da area do curso/reader, em um bloco proprio de material de apoio, com texto simples como "Baixar curso completo em PDF".

## Content Changes

Substituir trechos de marketing por orientacoes utilizaveis.

Exemplos de melhorias:

- explicar como organizar laudo, exames, relatorios escolares e historico de desenvolvimento;
- incluir perguntas para neuropediatra, psiquiatra infantil, psicologo, fonoaudiologo, terapeuta ocupacional e escola;
- orientar como comparar profissionais sem cair em promessa de cura;
- incluir um roteiro de conversa com familiares que minimizam ou culpabilizam;
- incluir um roteiro de primeira conversa com a escola;
- orientar o registro simples de sono, alimentacao, comunicacao, crises, interesses, sensibilidades e pequenas evolucoes;
- trocar frases absolutas por orientacoes contextualizadas;
- transformar checklists superficiais em listas que ajudam a tomar decisao.

## Tone

O tom deve ser:

- humano, calmo e sem alarmismo;
- objetivo, sem infantilizar a familia;
- respeitoso com a crianca autista;
- cuidadoso com culpa parental;
- pratico, com foco em proxima acao.

Evitar:

- "cura", "normalizar", "consertar", "vencer o autismo";
- promessas como "voce estara no controle";
- gatilhos emocionais exagerados;
- linguagem de funil de vendas no corpo do curso;
- afirmacoes medicas sem ressalva.

## Product Boundary

Este trabalho reescreve o conteudo principal do guia e melhora os anexos textuais dentro do Markdown.

Tambem esta incluido:

- disponibilizar uma opcao de download do curso completo em PDF dentro do curso;
- usar um asset PDF local ou placeholder estavel enquanto a diagramacao final nao existir;
- manter o download restrito ao fluxo de acesso do produto, sem expor como chamada principal da landing publica.

Fora de escopo:

- criar a diagramacao visual final do PDF;
- criar assets visuais definitivos;
- implementar um novo editor;
- mudar a arquitetura de importacao;
- criar landing page nova;
- validar clinicamente o material com especialista.

## Implementation Impact

O arquivo Markdown continua sendo a fonte do curso. A reescrita deve preservar marcadores principais que o importador atual usa ou, se a estrutura mudar, o importador e seus testes devem ser ajustados juntos.

Pontos tecnicos relevantes:

- `src/domains/course-import/guide-pratico.ts` depende de marcadores como `## PARTE 1`, `## PARTE 2` e `## PARTE 3`.
- A reestruturacao editorial provavelmente exigira atualizar o parser para importar mais capitulos de forma limpa.
- Os testes de importacao devem validar que o novo curso tem secoes praticas, checklists e downloads coerentes.
- O bloco `download` deve apontar para um PDF do curso completo quando o arquivo existir, ou para um identificador placeholder claro enquanto o PDF final nao for gerado.

## Validation

Verificacao esperada apos a implementacao:

- revisar o Markdown completo para tom, utilidade e coerencia;
- rodar testes automatizados relacionados ao importador;
- rodar lint/build se houver alteracao no codigo;
- validar que o reader exibe a opcao de download do PDF para usuario com acesso;
- abrir o reader no navegador se a aplicacao estiver em execucao ou se for necessario validar leitura real.

## Risks

Risco principal: o tema envolve saude, educacao e desenvolvimento infantil. O material deve ser util sem parecer prescricao clinica.

Mitigacao:

- inserir aviso claro de que o guia nao substitui acompanhamento profissional;
- usar linguagem de apoio a decisao;
- evitar diagnosticos, promessas ou protocolos rigidos;
- recomendar profissionais qualificados e fontes confiaveis.
