# Waynovo 5.3 — Unified Bookmarklet

Workspace de estudo com bookmarklet portátil, revisão espaçada local e integração opcional com um gateway de IA.

## Usar o Waynovo

Abra a página publicada pelo GitHub Pages. O app funciona como site e pode ser instalado como PWA em navegadores compatíveis. Após a primeira visita, o shell da interface e o módulo de revisão ficam disponíveis offline.

## Bookmarklet unificado

O código-fonte do painel portátil fica em `bookmarklet.js` e é carregado pela página de instalação. O bookmarklet reúne, em uma única interface, laboratório de estudo, geração local de lições/resumos/exercícios/checklists/glossários, cartões de revisão, editor rápido com notas locais, temporizador de foco e integração opcional com o gateway de IA. O painel é arrastável, minimizável, tem tema claro/escuro e pode ser fechado com Esc.

O bookmarklet usa Shadow DOM para isolar o visual, não importa bibliotecas/CDNs e não executa código remoto. Os cartões e notas ficam no armazenamento local do navegador da página onde foi aberto; o endpoint do gateway pode ser lembrado apenas na sessão. O token do gateway permanece no campo enquanto o painel está aberto.

## Bookmarklet portátil

1. Abra a seção Bookmarklet na página do Waynovo.
2. Arraste **Waynovo · abrir painel** para a barra de favoritos ou copie o código para a URL de um novo favorito.
3. Em uma página de curso, artigo ou documentação, selecione o texto visível e clique no favorito.
4. Escolha uma ferramenta local ou use seu gateway de IA configurado. Se a página bloquear bookmarklets ou o texto estiver dentro de um iframe isolado, copie o trecho para o painel manualmente.

O bookmarklet é autônomo: não carrega bibliotecas por CDN. Usa somente a seleção visível ou texto colado. Não percorre a página, não lê conteúdo oculto nem envia formulários.

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

## Bypass Engine — laboratório local

A aba **Bypass Lab** adiciona um motor executável de políticas com adaptadores registrados no próprio bookmarklet. O laboratório roda integralmente no navegador, sem chamadas de rede e sem interagir com serviços externos.

### Como testar

1. Abra o bookmarklet e selecione **Bypass Lab**.
2. No adaptador **Gate de recurso no cliente**, mantenha o JSON de exemplo e clique em **Executar baseline**. O resultado esperado é `DENY`.
3. Clique em **Aplicar override QA**. O resultado esperado é `ALLOW`: esse adaptador é explicitamente `owned-lab`, declara autoridade do lado do cliente e exige uma fixture com `mode: "test"`.
4. Troque para **Permissão baseada em fixture confiável** e clique em **Aplicar override QA**. O resultado continua `DENY`: essa política não aceita override e considera somente `fixture.grants`, ignorando campos como `role: "admin"` ou `qaOverride: true` vindos do payload do cliente.
5. Para testar uma concessão válida, edite o JSON e inclua `"premium-reports"` no array `fixture.grants`; rode o baseline novamente. O resultado esperado é `ALLOW`.
6. Clique em **Rodar suíte de testes** para executar os quatro casos automaticamente. **Exportar auditoria** salva os eventos em JSON.

### Modelo de adaptadores

Cada adaptador precisa ter um identificador único, `scope: "owned-lab"` e uma função `evaluate`. O override de QA só é elegível quando o adaptador também declara `authority: "client"` e `qaOverride: true`, e a fixture está em modo de teste. A decisão protegida usa uma fonte de permissões separada do payload do cliente.

Este recurso é uma bancada de engenharia e QA. Não deve ser conectado a serviços de terceiros para contornar autenticação, autorização, limites ou registros de progresso. Em integrações próprias, mantenha a autorização real no servidor; o override de QA deve existir apenas em ambientes de teste.

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
