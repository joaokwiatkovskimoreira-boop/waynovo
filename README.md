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

## Próximas etapas

A estrutura está preparada para evoluir para uma extensão/aplicativo independente, mantendo o bookmarklet como uma forma leve de acesso.
