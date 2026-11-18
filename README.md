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

## Integração de IA

A IA é opcional. Publique o Worker descrito em [AI_GATEWAY.md](AI_GATEWAY.md), configure a chave do provedor como secret do servidor e informe no app apenas o endpoint e o token de acesso do gateway. O token fica no campo enquanto o painel está aberto; não é gravado em localStorage ou sessionStorage. A chave OpenAI/Gemini nunca deve ser colocada no código público ou no bookmarklet. Use secrets no Worker e revogue imediatamente qualquer chave que tenha sido publicada por engano.

O texto selecionado/colado é enviado ao provedor somente quando você aciona a geração. APIs podem ter custos e limites próprios.

## Privacidade e compatibilidade

Tarefas e cartões ficam no armazenamento local do navegador e não são sincronizados entre dispositivos automaticamente. Faça backups regulares. Alguns sites ou navegadores bloqueiam bookmarklets por política de segurança; não há garantia de execução em todos os domínios. Nesses casos, cole o conteúdo no app.
