# Gateway multi-provedor de IA do Waynovo

O Worker funciona como roteador para **Google Gemini, Groq e OpenRouter**. As chaves dos provedores ficam exclusivamente como secrets no Cloudflare; o app e o bookmarklet recebem somente o token de acesso do gateway.

## 1. Preparar o Worker

Instale e autentique o Wrangler, entre na pasta do projeto e publique:

\`\`\`bash
npm install -g wrangler
wrangler login
wrangler deploy
\`\`\`

O arquivo \`wrangler.toml\` já define os nomes dos modelos, a ordem padrão e a origem CORS. Edite os modelos para IDs que estejam disponíveis na sua conta antes de publicar.

## 2. Cadastrar as chaves como secrets

Cadastre apenas as chaves dos provedores que pretende usar. Para habilitar o fallback completo, configure as três:

\`\`\`bash
wrangler secret put WAYNOVO_ACCESS_TOKEN
wrangler secret put GEMINI_API_KEY
wrangler secret put GROQ_API_KEY
wrangler secret put OPENROUTER_API_KEY
\`\`\`

\`WAYNOVO_ACCESS_TOKEN\` é uma senha longa criada por você; ela não é a chave de nenhum provedor. Gere um valor forte localmente, por exemplo com \`openssl rand -hex 32\`, e não o publique.

Nunca coloque essas chaves em \`bookmarklet.js\`, \`app.js\`, \`index.html\`, \`wrangler.toml\`, no GitHub ou em prints públicos. Para trocar uma chave, rode novamente \`wrangler secret put NOME_DA_CHAVE\`.

## 3. Escolher modelos e prioridade

Em \`wrangler.toml\`, configure:

- \`AI_PRIMARY_PROVIDER\`: provedor primário automático: \`gemini\`, \`groq\` ou \`openrouter\`.
- \`AI_PROVIDER_ORDER\`: ordem de fallback, separada por vírgulas.
- \`GEMINI_MODEL\`, \`GROQ_MODEL\`, \`OPENROUTER_MODEL\`: IDs exatos dos modelos habilitados nas respectivas contas.
- \`CORS_ORIGINS\`: \`*\` para uso em qualquer página ou uma lista de origens confiáveis separadas por vírgula.

Exemplo de rota: Gemini → Groq → OpenRouter. Os nomes dos modelos não são presumidos pelo código: informe IDs atuais dos painéis de cada serviço, pois catálogos e cotas podem mudar.

Depois de editar as variáveis:

\`\`\`bash
wrangler deploy
\`\`\`

O OpenRouter aceita IDs de modelos publicados no catálogo dele; modelos gratuitos costumam ter o sufixo \`:free\` quando oferecidos nessa modalidade. Disponibilidade, limites e requisitos de uso dependem do catálogo e da conta.

## 4. Configurar o Waynovo

No app ou na aba **IA** do bookmarklet:

1. Informe o endpoint \`https://SEU-WORKER.workers.dev/generate\`.
2. Informe o \`WAYNOVO_ACCESS_TOKEN\` no campo Token do gateway.
3. Escolha **Automático** para respeitar a prioridade do Worker, ou selecione Gemini, Groq ou OpenRouter como provedor preferido.
4. Mantenha o fallback ativado para tentar os outros provedores quando o primeiro falhar.

A seleção do cliente não revela nem transmite as chaves dos provedores. Ela envia somente o nome do provedor preferido e a opção de fallback. O Worker verifica quais secrets e modelos estão configurados antes de tentar cada serviço.

## 5. Como o fallback funciona

O Worker:

- tenta primeiro o provedor escolhido ou o primário configurado;
- ignora provedores sem chave ou sem modelo configurado;
- tenta o próximo em caso de erro HTTP, limite de uso, falha de rede, timeout ou resposta vazia;
- devolve o nome do provedor, modelo e status das tentativas que foram feitas;
- não repete indefinidamente uma solicitação.

Quando o fallback está desativado, somente o provedor escolhido é tentado. Quando o provedor preferido está em manutenção ou atingiu o limite gratuito, os demais podem atender a solicitação, desde que estejam configurados e disponíveis.

## 6. Compatibilidade anterior

A configuração antiga com \`AI_PROVIDER\`, \`AI_API_KEY\`, \`AI_MODEL\` e \`AI_API_BASE_URL\` continua aceita para instalações que usavam um único provedor. A configuração multi-provedor recomendada usa secrets e variáveis específicas por serviço.

## Privacidade, cotas e segurança

O material é enviado ao provedor somente após o usuário acionar a geração. O gateway não grava o texto recebido. Cada provedor aplica seus próprios termos, limites e políticas de retenção/uso de dados; revise esses termos e evite enviar informações confidenciais.

Planos gratuitos não são ilimitados: podem aplicar limites por minuto, por dia, por modelo ou por conta. O fallback aumenta a chance de uma geração funcionar, mas não garante disponibilidade nem gratuidade permanente. Configure também regras de rate limiting no Cloudflare e restrinja \`CORS_ORIGINS\` a origens conhecidas sempre que possível.

O token do gateway funciona como uma credencial compartilhada do Worker. Não o coloque em repositórios públicos nem o distribua como se fosse uma chave universal para terceiros. Para uso público, prefira autenticação individual e limites por usuário.
