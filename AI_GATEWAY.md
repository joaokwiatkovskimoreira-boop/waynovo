# Gateway de IA do Waynovo

A chave do provedor fica em um secret do servidor. O navegador recebe apenas um token de acesso separado para chamar este gateway.

## Cloudflare Workers

1. Crie um Worker chamado `waynovo-ai-gateway`.
2. Publique `worker.js` (com `wrangler.toml` como configuração).
3. Em Settings → Variables and Secrets, configure como **secrets**:
   - `AI_API_KEY`: chave do provedor.
   - `WAYNOVO_ACCESS_TOKEN`: token forte e exclusivo de acesso ao gateway.
4. Configure as variáveis normais:
   - `AI_PROVIDER`: `openai-compatible` ou `gemini`.
   - `AI_MODEL`: identificador do modelo disponível na sua conta.
   - `AI_API_BASE_URL`: para API compatível, normalmente `https://api.openai.com/v1`.
   - `CORS_ORIGINS`: `*` para usar o bookmarklet em múltiplos sites, ou uma lista de origens autorizadas separadas por vírgula.
5. Publique. O endpoint será `https://SEU-WORKER.workers.dev/generate`.
6. Na página Waynovo ou no bookmarklet, informe o endpoint e o token de acesso do Worker. Não coloque a chave do provedor nesses campos.

Gere um token forte localmente, por exemplo com `openssl rand -hex 32`. Nunca publique esse valor.

## Como funciona

O gateway aceita POST JSON com `task`, `content` e `pageTitle`. Tarefas: lesson, explain, summary, flashcards, practice, plan, checklist e translate. O código suporta API OpenAI-compatible Chat Completions e Gemini generateContent.

O Worker não persiste os materiais nem grava o corpo das solicitações. O texto enviado será processado pelo provedor escolhido; não envie material confidencial. Configure regras de Rate Limiting no Cloudflare e acompanhe os custos/limites do provedor.
