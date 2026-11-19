# Waynovo 6.4 — Portable Bookmarklet

Bookmarklet portátil gratuito para estudo, organização, automação local, monitoramento automático de páginas visíveis e experimentação de políticas em laboratório, com revisão espaçada e IA opcional.

## Waynovo 6.4 — Navegação rápida

A versão 6.4 adiciona uma paleta de navegação no cabeçalho do bookmarklet. O botão de busca filtra as 13 seções em tempo real, ignora diferenças de acentuação e permite abrir a seção escolhida sem percorrer a barra de abas. As setas do teclado percorrem os resultados, Enter abre a seção e Esc fecha a paleta sem fechar o painel. A busca funciona localmente e não envia o texto digitado para nenhum serviço.

## Usar o Waynovo

Abra a página de instalação publicada pelo GitHub Pages. Ela entrega o bookmarklet e os recursos do workspace; o painel portátil é o foco desta distribuição. Depois de copiar o favorito, ele executa localmente no navegador, sem exigir que o painel faça download de scripts.

## Bookmarklet unificado

O código-fonte do painel portátil fica em `bookmarklet.js` e é carregado pela página de instalação. O bookmarklet reúne, em uma única interface, laboratório de estudo, geração local de lições/resumos/exercícios/checklists/glossários, cartões de revisão, editor rápido com notas locais, temporizador de foco e integração opcional com o gateway de IA. O painel é arrastável, minimizável, tem tema claro/escuro e pode ser fechado com Esc.

O bookmarklet usa Shadow DOM fechado para reduzir o acesso direto dos scripts da página hospedeira à interface, não importa bibliotecas/CDNs e não executa código remoto. Os cartões e notas ficam no armazenamento local do navegador da página onde foi aberto; o endpoint do gateway pode ser lembrado apenas na sessão. O token do gateway permanece no campo enquanto o painel está aberto.

## Bookmarklet portátil

1. Abra a seção Bookmarklet na página do Waynovo.
2. Arraste **Waynovo · abrir painel** para a barra de favoritos ou copie o código para a URL de um novo favorito.
3. Abra o favorito na página que deseja estudar. O **Autopilot** começa a varredura do texto renderizado e visível automaticamente.
4. Confira a aba **Autopilot** para ver tempo de uso, varreduras, questões detectadas e rascunhos sugeridos. Se a página bloquear bookmarklets ou o conteúdo estiver dentro de um iframe isolado, cole o trecho manualmente.

O favorito desktop é autocontido: inclui o código do painel e não carrega bibliotecas por CDN nem scripts remotos. O código curto usado na instalação Android é um carregador versionado que busca `bookmarklet.js` do repositório; por isso precisa de conectividade quando o arquivo ainda não está em cache e pode ser bloqueado por CSP. O Autopilot percorre apenas texto renderizado em elementos visíveis da página atual; ignora conteúdo oculto, campos de entrada, botões comuns e iframes isolados. O monitor extrai enunciados, alternativas acessíveis e evidências textuais localmente, sem enviar formulários nem clicar em respostas.

## Módulos do bookmarklet

A aba **Módulos** reúne seis fluxos independentes:

- **WaygroundX:** transforma um enunciado selecionado em material de explicação e prática inédita.
- **LeiaPR:** organiza trechos de leitura em resumo e termos para revisão.
- **Redação:** envia o texto selecionado ao editor local para estruturação e revisão.
- **Khan:** prepara uma lição de revisão de conceitos.
- **Alura:** prepara notas e checklist pessoal de aula.
- **Fubanga Hub:** catálogo local dos módulos internos; não baixa nem executa scripts remotos.

A detecção de plataforma é apenas informativa. Os módulos trabalham com texto selecionado ou colado pelo usuário; não fazem varredura de conteúdo oculto, envio automático de respostas, alteração de notas ou simulação de conclusão em serviços externos. Todos compartilham o editor, os cartões, as notas, o temporizador e a integração opcional com IA.

## Assistente de questões inspirado no WaygroundXGen

A aba **Questões** aceita enunciado e alternativas colados pelo usuário, prepara um roteiro de análise e pode enviar o conteúdo ao gateway de IA configurado para explicar o conceito, comparar alternativas e justificar a resposta provável. O envio é iniciado pelo próprio usuário; não há leitura de questões ocultas, clique em alternativas ou submissão automática em plataformas externas.

A implementação aproveita a ideia geral de análise de questões com IA, mas não incorpora o mecanismo de geração de bookmarklets do projeto de referência que injeta chaves de API no código, substitui `window.eval` e carrega um script remoto por CDN. No Waynovo, as chaves do provedor devem permanecer como secrets no gateway; o bookmarklet recebe apenas o token temporário do gateway.

## Cognitive Engine — aba Cérebro

A aba **Cérebro** combina um planejador local com um executor assistido por IA. Informe um objetivo e, opcionalmente, contexto: o motor classifica o tipo de tarefa por regras simples, cria etapas, explica por que cada etapa foi sugerida, acompanha o progresso e mantém o plano ativo no navegador.

- **Planejamento local:** cria planos para aprendizagem, produção de conteúdo, pesquisa/análise, organização/automação, desenvolvimento técnico e objetivos gerais.
- **Verificação:** cada etapa inclui uma razão e o fluxo termina com conferência de critérios e pendências.
- **Memória local explícita:** planos só entram na memória quando você toca em Guardar na memória. É possível reabrir ou apagar os registros.
- **Execução assistida:** o Action Lab produz uma entrega para a etapa atual; Auditar resultado solicita uma segunda revisão crítica. Ambas exigem clique explícito e usam o provedor/fallback escolhido na aba IA.
- **Continuidade:** o plano ativo, a última entrega e a auditoria são recuperados no mesmo navegador.
- **Análise opcional por IA:** usa o endpoint e o token já configurados na aba IA; o envio só acontece após o clique em Analisar objetivo com IA.
- **Privacidade:** memória e planos ficam no armazenamento local do navegador e não são sincronizados.

O planejador local **não é um modelo de linguagem**: usa heurísticas transparentes e não verifica fatos sozinho. A execução assistida produz rascunhos e análises com o modelo configurado; a auditoria é uma segunda opinião, não uma garantia de correção. O gateway aceita a tarefa `verify` e valida o tamanho real do corpo JSON em bytes. Provedores podem ter custos/limites e os resultados devem ser conferidos. Marcar uma etapa significa apenas registrar manualmente que ela foi concluída; o motor não executa ações em sites externos.
## Motor de automação e sandbox

A aba **Automação** inclui um motor de fluxos demonstrativo com etapas sequenciais, condições e estado isolado em memória. Há três cenários: sessão de estudo fictícia, navegação entre páginas de exemplo e validação local de estado. O registro mostra o resultado de cada etapa e o ambiente pode ser reiniciado.

O sandbox não controla sites reais, não faz autenticação externa, não altera progresso de cursos e não envia respostas. Ele serve para desenvolver e testar a arquitetura de automação com segurança antes de conectar adaptadores a ambientes próprios ou explicitamente autorizados.

## Bypass Engine — aba do bookmarklet

O produto principal desta etapa é o **bookmarklet portátil**. A aba **Bypass Lab** fica dentro do painel flutuante e não depende de um servidor para executar seus cenários. A página Waynovo serve como instalador/gerador do favorito; depois de copiado, o bookmarklet contém o código e roda localmente na aba atual. Sem IA, não há chamadas de rede nem custo de provedor.

### Cenários disponíveis

1. **Gate cliente:** compara a decisão normal de um sinalizador local com um override de QA.
2. **Permissão confiável:** usa uma fixture separada do payload do cliente e demonstra por que `role: "admin"` enviado pelo navegador não deve conceder privilégios.
3. **Rate limit:** testa contadores e limites fictícios, sem enviar requisições.
4. **Tolerância a falhas:** injeta uma exceção local e verifica que o resultado termina em negação segura (*fail closed*).

O menu de cenários carrega oito exemplos prontos. Para cada um, edite o JSON, selecione o adaptador e execute o baseline ou a estratégia de QA. O override exige três condições: adaptador `owned-lab` de autoridade `client` com QA habilitado, ambiente `test` e a caixa **Autorizo override QA** marcada na interface. A autorização não pode ser habilitada apenas editando o JSON.

A suíte embutida executa **11 casos**: baseline permitido/negado, autorização explícita, bloqueio fora de test, payload forjado, grants confiáveis, limites de tentativas e falhas de dependência. A trilha de auditoria registra decisões e motivos, sem salvar o contexto JSON fornecido. O histórico permanece no `sessionStorage` da aba e pode ser exportado em JSON.

### Testar o motor de referência

O arquivo `bypass-engine.js` contém a implementação de referência testável em Node, e `bookmarklet.js` mantém uma versão embutida para continuar autônomo. Os cenários e as regras devem permanecer alinhados entre as duas versões.

Execute os testes com Node.js:

```bash
node --check bookmarklet.js
node --check app.js
node --input-type=module --check < worker.js
node --test tests/*.test.js
```

Este laboratório é para QA e engenharia em código e fixtures que você controla. Não se conecta a plataformas externas nem implementa contorno operacional de autenticação, autorização, limites, avaliações ou registros de progresso de terceiros. Em qualquer integração real própria, a decisão de autorização deve permanecer no servidor.

## Autopilot — varredura e rascunhos automáticos

Ao abrir o bookmarklet, o Autopilot inicia automaticamente um monitor local da página atual. Ele faz uma primeira varredura e repete a análise em intervalos curtos; mudanças no DOM visível também agendam uma nova varredura.

- **Tempo de uso:** conta o tempo em que o Waynovo permanece aberto e a aba está visível.
- **Varreduras:** conta as leituras locais da estrutura visível da página.
- **Questões detectadas:** conta enunciados únicos reconhecidos durante a sessão.
- **Alternativas visíveis:** reconhece rótulos comuns (A–E), opções e componentes acessíveis de múltipla escolha sem clicar neles.
- **Rascunhos sugeridos:** cruza palavras do enunciado com trechos visíveis da própria página e reúne evidências textuais para revisão.
- **Ponte para o Tutor:** leva enunciado, alternativas e evidências reconhecidas à aba Questões, sem exigir copiar e colar. O Tutor inclui o material de apoio na análise, separa evidência de inferência e solicita nível de confiança.
- **Operação local:** o provedor padrão da aba IA é Local; não usa API, não exige token e não envia o conteúdo para fora do navegador. Provedores externos são opt-in.
- **Controles:** é possível pausar, retomar, forçar uma varredura e copiar os rascunhos.

### Task Queue 4.0 — pipeline inteligente e auditoria

A aba **Autopilot** agora possui uma fila local de tarefas sequenciais:

- Cada nova questão detectada gera automaticamente um dossiê local com enunciado, alternativas reconhecidas e trechos de apoio; a fila processa esse dossiê sem clicar ou submeter opções.
- **Gerar pacote da página** cria uma etapa de controle de qualidade da fonte e, após aprovação, cinco tarefas dependentes: resumo, flashcards, exercícios originais, glossário e mapa de tópicos. **Gerar pacote do texto colado** aplica o mesmo pipeline.
- O estado de cada tarefa é registrado como pendente, em execução, concluída ou falha. Dependências impedem que os geradores comecem antes da aprovação da fonte; adaptadores também validam a saída antes de marcar uma tarefa como concluída. A fila executa uma tarefa por vez e permite pausar, retomar e repetir falhas.
- Tarefas pendentes são recuperadas ao reabrir o bookmarklet na mesma aba. A fila e os artefatos ficam em sessionStorage; os flashcards gerados também entram no baralho local.
- **Visualizar saída** permite consultar o resumo, exercícios, flashcards, glossário, mapa de tópicos e dossiês produzidos. **Baixar auditoria** exporta JSON com estados e eventos, sem incluir o conteúdo integral da página. Os títulos das tarefas usam rótulos genéricos/identificadores, não trechos do enunciado; o JSON exportado contém somente metadados e eventos, sem payloads do material.

A fila utiliza seis adaptadores registrados — resumo, prática, flashcards, glossário, mapa de tópicos e dossiê de questão — com escopo `owned-local`, lista de adaptadores e validação de contrato. Flashcards são deduplicados e respeitam o limite de 300 cartões. A fila executa somente transformações locais do Waynovo. Ela não usa a IA online por padrão, não envia conteúdo ao site, não clica em alternativas, não preenche formulários e não marca tarefas externas como concluídas.

Os rascunhos são extração e correspondência textual, não respostas verificadas por um modelo. A extração de alternativas depende da estrutura e da acessibilidade do HTML de cada página; layouts especiais podem exigir revisão manual. O contador mede questões detectadas e rascunhos preparados; não afirma que uma avaliação foi concluída ou que uma resposta foi submetida. O Autopilot não lê conteúdo oculto, campos privados ou documentos de iframes isolados, e não clica em alternativas nem envia respostas a serviços externos. A aba Tutor pode explicar a questão e comparar as opções depois que o usuário aciona a análise. Para automações que alteram dados, use apenas ambientes próprios e adaptadores autorizados.

## Ferramentas

- Lição offline, resumo, flashcards, perguntas de prática e checklist.
- Baralhos interativos com cartões Difícil/Bom/Fácil e agendamento de revisão espaçada.
- Cartões difíceis voltam após 10 minutos; os intervalos de cartões conhecidos aumentam progressivamente.
- Contadores de cartões criados, pendentes e revisados no dia.
- Temporizador de foco com registro automático de sessões concluídas.
- Metas diárias ajustáveis, sequência de dias ativos e gráfico semanal de estudo.
- Histórico recente por assunto, com registro manual ou automático.
- Rascunho automático, estimativa de leitura e fila local de tarefas.
- Importação/exportação JSON com tarefas, cartões, estatísticas de revisão, metas e histórico de sessões.
- Cópia e exportação de material de estudo para TXT.

Atalho: **Ctrl + Shift + F** leva diretamente ao laboratório de revisão. Na sessão de cartões, a tecla Espaço revela a resposta quando o foco não está em um campo ou botão.

## Metas e histórico de estudo

Defina uma meta diária, registre sessões manualmente ou deixe o temporizador contabilizar uma sessão quando chegar ao fim. O painel mostra o total do dia, os últimos sete dias, dias ativos consecutivos e as sessões recentes. Os registros ficam no navegador e entram no backup JSON.

## Integração multi-provedor de IA

A integração suporta **Google Gemini, Groq e OpenRouter**, com seleção manual, modo automático e fallback. O app principal e o bookmarklet enviam ao gateway apenas a tarefa, o conteúdo autorizado, o provedor preferido e a preferência de fallback.

Publique o Worker descrito em [AI_GATEWAY.md](AI_GATEWAY.md). Cadastre \`WAYNOVO_ACCESS_TOKEN\`, \`GEMINI_API_KEY\`, \`GROQ_API_KEY\` e \`OPENROUTER_API_KEY\` como secrets do Cloudflare Worker; ajuste os três IDs de modelo em \`wrangler.toml\`. Não publique chaves em arquivos do repositório.

O roteador tenta o provedor preferido e, quando habilitado, segue a ordem de fallback configurada no Worker. Provedores sem chave/modelo são ignorados. A resposta informa o provedor e o modelo utilizados, além do estado das tentativas.

Planos gratuitos têm cotas e podem mudar. O fallback não garante disponibilidade ou gratuidade permanente. O material só é enviado após o clique de geração; evite informações confidenciais e confira as políticas de dados de cada provedor.
## Privacidade e compatibilidade

Tarefas e cartões ficam no armazenamento local do navegador e não são sincronizados entre dispositivos automaticamente. Faça backups regulares. Alguns sites ou navegadores bloqueiam bookmarklets por política de segurança; não há garantia de execução em todos os domínios. Nesses casos, cole o conteúdo no app.


 

## Histórico — Waynovo 6.3 — Refinamento, robustez e fluidez

A versão 6.3 corrige a exibição de consumo de tokens no painel quando o gateway retorna uso da API, torna os cronômetros resistentes à suspensão/retomada de abas usando horário de término em vez de decrementos acumulados e reforça a importação de backups: arquivos acima de 5 MB são recusados, tarefas e cartões duplicados recebem IDs novos, os campos de cartões e estatísticas são normalizados, textos importados têm limites de tamanho e sessões do planejador são limitadas a 1.000 registros. A instalação Android aponta para o bookmarklet 6.4 e o cache offline foi invalidado para entregar os arquivos atualizados.



A validação contínua executa no GitHub Actions com Node 24. Na revisão de importação e segurança mais recente, a suíte passou com **70 testes e zero falhas**, além das verificações de sintaxe JavaScript e manifesto PWA.

A interface recebeu transições curtas baseadas em opacidade/transformação, estados de foco visíveis por teclado, feedback de interação e respeito a `prefers-reduced-motion`. As animações são discretas e não dependem de bibliotecas. O projeto exibe a assinatura **feito pelo russo**.

## Waynovo 6.2 — Music Player + Integrated Bookmarklet Suite

A distribuição 6.2 amplia o bookmarklet único com uma aba **Player** e uma aba **Extras**. O Waynovo Music recebe links ou IDs de vídeos e playlists do YouTube/YouTube Music, mantém uma fila temporária na sessão da aba (sessionStorage), permite avançar/voltar/parar e reproduz no player oficial incorporado. A busca por música abre resultados oficiais do YouTube Music; não usa API de busca nem promete resultados incorporados. O player também oferece **Manter tela ativa**, um controle voluntário baseado na Screen Wake Lock API: tenta impedir que o ecrã desligue enquanto a aba está visível, mas o sistema pode liberar o bloqueio ou o navegador não oferecer suporte. Isso não impede nem contorna a pausa/pergunta de inatividade do próprio YouTube. O YouTube pode exigir interação do usuário para iniciar a reprodução. O player respeita a incorporação oficial; a busca abre o YouTube Music em outra aba porque resultados de pesquisa não são fornecidos pelo embed de player.

A aba Extras reúne onze utilitários locais: modo leitura (captura texto visível), mapa navegável de títulos, auditoria de links, verificação heurística de acessibilidade, inspeção de metadados/SEO, caderno de seleção, exportação de tabelas para CSV, diagnóstico de desempenho, inspetor de seletores CSS, URL Toolkit (com remoção de parâmetros de rastreamento e redação de credenciais) e JSON Formatter (validação e formatação sem executar código). Os relatórios podem ser copiados ou baixados. As ferramentas não tentam acessar campos privados, alterar respostas, submeter formulários ou contornar controles do site.

O instalador Android usa `bookmarklet.js?v=6.4` e o cache do app foi atualizado para `waynovo-shell-v17`. O player depende da disponibilidade dos embeds e das regras do YouTube; conteúdo removido, restrito por idade, bloqueado para incorporação ou limitações do navegador podem impedir reprodução. A compatibilidade real ainda deve ser validada em Android/iOS e diferentes navegadores.
