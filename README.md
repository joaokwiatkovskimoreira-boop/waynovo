# Waynovo 5.2

Workspace de estudo com bookmarklet portátil, revisão espaçada local e integração opcional com um gateway de IA.

## Usar o Waynovo

Abra a página publicada pelo GitHub Pages. O app funciona como site e pode ser instalado como PWA em navegadores compatíveis. Após a primeira visita, o shell da interface e o módulo de revisão ficam disponíveis offline.

## Bookmarklet portátil

1. Abra a seção Bookmarklet na página do Waynovo.
2. Arraste **Waynovo · abrir painel** para a barra de favoritos ou copie o código para a URL de um novo favorito.
3. Em uma página de curso, artigo ou documentação, selecione o texto visível e clique no favorito.
4. Escolha uma ferramenta local ou use seu gateway de IA configurado. Se a página bloquear bookmarklets ou o texto estiver dentro de um iframe isolado, copie o trecho para o painel manualmente.

O bookmarklet é autônomo: não carrega bibliotecas por CDN. Usa somente a seleção visível ou texto colado. Não percorre a página, não lê conteúdo oculto nem envia formulários.

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

A IA é opcional. Publique o Worker descrito em [AI_GATEWAY.md](AI_GATEWAY.md), configure a chave do provedor como secret do servidor e informe no app apenas o endpoint e o token de acesso do gateway. O token fica no campo enquanto o painel está aberto; não é gravado em localStorage ou sessionStorage. A chave OpenAI/Gemini nunca deve ser colocada no código público.

O texto selecionado/colado é enviado ao provedor somente quando você aciona a geração. APIs podem ter custos e limites próprios.

## Privacidade e compatibilidade

Tarefas e cartões ficam no armazenamento local do navegador e não são sincronizados entre dispositivos automaticamente. Faça backups regulares. Alguns sites ou navegadores bloqueiam bookmarklets por política de segurança; não há garantia de execução em todos os domínios. Nesses casos, cole o conteúdo no app.
