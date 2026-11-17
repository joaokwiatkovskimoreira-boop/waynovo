# Waynovo

Workspace responsivo e bookmarklet para organizar materiais e preparar atividades de estudo.

## Executar localmente

Abra \`index.html\` no navegador. Não há etapa de build nem dependências de JavaScript.

## Bookmarklet

1. Publique o repositório pelo GitHub Pages (Settings → Pages → Deploy from a branch → main → /(root)).
2. Abra a página publicada do Waynovo.
3. Arraste o botão **Waynovo · abrir painel** para a barra de favoritos. Como alternativa, use **Copiar código** e crie um favorito colando o código no campo URL.
4. Em uma página que você tem autorização para usar, selecione um trecho de texto e clique no favorito.
5. Escolha uma ferramenta, prepare a instrução e copie ou salve o resultado.

O bookmarklet carrega \`bookmarklet.js\` pelo CDN jsDelivr. Políticas de segurança (CSP), navegadores ou páginas específicas podem impedir a execução. Ele é acionado manualmente e usa apenas a seleção atual ou o texto que você colar. Não faz varredura do DOM, não lê respostas ocultas, não clica em alternativas e não envia formulários.

## Recursos atuais

- Layout responsivo para desktop e celular.
- Tema claro/escuro com preferência salva localmente.
- Fila de tarefas persistente no navegador.
- Pesquisa e exportação da fila em JSON.
- Bookmarklet flutuante com Shadow DOM para isolamento visual.
- Preparação de instruções para explicações, resumos, flashcards, questões inéditas, planos e traduções.
- Cópia e exportação local em TXT.

## Privacidade e limites

A fila usa o armazenamento local do navegador. O bookmarklet não envia os trechos selecionados para servidores. O texto só sai do navegador quando você decide copiá-lo para outra ferramenta. Não há chave de API no front-end. Integrações futuras devem usar endpoints autorizados e manter credenciais no servidor, nunca em código público do navegador.

## Recursos atuais\n\n- Interface responsiva, tema claro/escuro e temporizador de foco.\n- Bookmarklet autônomo sem CDN, com ferramentas offline e integração opcional com gateway de IA.\n- Lições, resumos, flashcards, perguntas de prática e checklists.\n- Rascunho automático, estimativa de leitura e fila local.\n- Importação/exportação JSON, cópia/download TXT e reabertura de tarefas.\n- Instalação como PWA e interface disponível offline depois da primeira visita.\n\n## IA e credenciais\n\nConsulte `AI_GATEWAY.md`. A chave do provedor fica como secret no servidor. O navegador usa um token separado do gateway, mantido apenas no campo enquanto o painel está aberto. O Waynovo não grava esse token em localStorage ou sessionStorage. O texto selecionado/colado é enviado ao provedor somente quando você aciona a geração.\n\n## Compatibilidade\n\nO bookmarklet usa apenas texto selecionado ou colado e não depende de bibliotecas remotas. Alguns sites e navegadores bloqueiam favoritos JavaScript; conteúdos em iframes isolados podem exigir cópia manual.\n