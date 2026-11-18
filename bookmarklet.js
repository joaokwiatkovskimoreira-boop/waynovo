(() => {
'use strict';
const ID='waynovo-unified-panel';
const old=document.getElementById(ID);if(old){if(typeof old.__waynovoCleanup==='function')old.__waynovoCleanup();else old.remove();return;}
const host=document.createElement('div');host.id=ID;(document.body||document.documentElement).appendChild(host);
const root=host.attachShadow({mode:'open'});
root.innerHTML=`
<style>
:host{all:initial;position:fixed;z-index:2147483647;right:14px;bottom:14px;color-scheme:dark;font:13px/1.45 system-ui,sans-serif;color:#edf0ff}
*{box-sizing:border-box}button,input,textarea,select{font:inherit}button{cursor:pointer}
.panel{width:min(470px,calc(100vw - 14px));max-height:88vh;display:flex;flex-direction:column;overflow:hidden;background:#101626;border:1px solid #303c59;border-radius:17px;box-shadow:0 24px 90px #000a;color:#edf0ff}
header{display:flex;align-items:center;gap:9px;padding:12px;background:linear-gradient(120deg,#1b2440,#171d31);border-bottom:1px solid #303b56;cursor:move;touch-action:none;user-select:none}
.logo{width:31px;height:31px;display:grid;place-items:center;border-radius:9px;background:linear-gradient(145deg,#9a89ff,#5e4bd1);font-weight:900}
.brand{font-size:14px;font-weight:850}.version{font-size:9px;color:#9da9c5}.spacer{flex:1}
.icon{width:29px;height:29px;border:1px solid #394662;border-radius:8px;background:#222d45;color:#dce3fb;font-size:16px}
nav{display:flex;gap:4px;padding:8px;background:#131b2c;border-bottom:1px solid #29344d}
.tab{flex:1;border:1px solid transparent;border-radius:8px;padding:8px 3px;background:transparent;color:#9eabc7;font-size:10px;font-weight:750}
.tab.active{background:#2b2850;border-color:#6056a3;color:#e6e1ff}
main{padding:12px;overflow:auto;min-height:0}.view{display:none}.view.active{display:block}
.eyebrow{font-size:9px;font-weight:850;letter-spacing:1px;text-transform:uppercase;color:#998bff;margin:1px 0 7px}
.desc{color:#9da9c2;font-size:10px;line-height:1.5;margin:4px 0 9px}
label{display:block;margin:10px 0 5px;color:#cbd4e9;font-size:10px;font-weight:750}
input,textarea,select{width:100%;border:1px solid #35415d;border-radius:9px;background:#0b1220;color:#edf0ff;padding:9px 10px;outline:none;font-size:11px}
textarea{min-height:100px;resize:vertical;line-height:1.5}.output{min-height:135px}
.row{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.row>*{flex:1;min-width:0}
.btn{border:1px solid #394662;border-radius:9px;padding:9px 10px;background:#202b43;color:#e0e7fa;font-size:10px;font-weight:800}
.primary{border-color:#7668df;background:linear-gradient(105deg,#8170ec,#5d50c7);color:white}
.soft{background:#292344;border-color:#514879;color:#ded7ff}
.status{min-height:16px;margin-top:7px;color:#8fe0bd;font-size:10px;white-space:pre-wrap;overflow-wrap:anywhere}
.meta{font-size:9px;color:#8592ad;margin-top:5px}
.auto-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}
.auto-stat{border:1px solid #303d59;border-radius:10px;padding:10px;background:#111a2b;min-width:0}
.auto-num{font-size:22px;font-weight:850;letter-spacing:-.5px;font-variant-numeric:tabular-nums}
.auto-item{border:1px solid #303d59;border-radius:10px;padding:10px;background:#151e30;margin-top:8px}
.auto-question{font-size:11px;font-weight:800;line-height:1.5;overflow-wrap:anywhere}
.auto-answer{margin-top:7px;color:#c2cce1;font-size:10px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}
.auto-evidence{margin-top:6px;color:#8fa0bf;font-size:9px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
:host([data-theme=light]) .auto-stat,:host([data-theme=light]) .auto-item{background:#fff;border-color:#dce1ed}
:host([data-theme=light]) .auto-answer{color:#34415a}
:host([data-theme=light]) .auto-evidence{color:#66748e}
.box{border:1px solid #2d3953;border-radius:11px;padding:11px;background:#151e30;margin-top:9px}
.timer{font-size:43px;font-weight:850;text-align:center;margin:14px 0 3px;font-variant-numeric:tabular-nums}.center{text-align:center}
.noteitem{display:flex;align-items:center;gap:6px;border:1px solid #2c3851;border-radius:9px;padding:7px;margin-top:6px;background:#141e30}
.noteinfo{min-width:0;flex:1}.notetitle{font-weight:800;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.notedate{font-size:9px;color:#8795b1}
.hint{border-left:2px solid #776be3;background:#1a2035;padding:8px 9px;border-radius:0 8px 8px 0;color:#b8c1d7;font-size:9px;line-height:1.5;margin-top:9px}
footer{padding:8px 12px;border-top:1px solid #29344d;color:#7f8ca8;font-size:9px;display:flex;justify-content:space-between}
.module-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.module-card{min-width:0;border:1px solid #2d3953;border-radius:11px;padding:10px;background:#151e30}.module-card b{font-size:11px}.module-card p{min-height:42px;margin:6px 0 9px;color:#9da9c2;font-size:9px;line-height:1.45}.module-card .btn{width:100%}
:host([data-theme=light]) .module-card{background:white;border-color:#dce1ed}
@media(max-width:360px){.module-grid{grid-template-columns:1fr}}
.minimized nav,.minimized main,.minimized footer{display:none}
:host([data-theme=light]){color-scheme:light;color:#20283a}
:host([data-theme=light]) .panel{background:#f7f8fc;color:#20283a;border-color:#d8deeb}
:host([data-theme=light]) header{background:#eceeff;border-color:#d8deeb}
:host([data-theme=light]) nav{background:#eef0fa;border-color:#dce1ed}
:host([data-theme=light]) input,:host([data-theme=light]) textarea,:host([data-theme=light]) select{background:white;color:#20283a;border-color:#d0d7e6}
:host([data-theme=light]) .box,:host([data-theme=light]) .noteitem{background:white;border-color:#dce1ed}
:host([data-theme=light]) .btn,:host([data-theme=light]) .icon{background:#eef0fa;color:#303950;border-color:#d7deeb}
:host([data-theme=light]) .primary{background:#6858d6;color:white}
@media(max-width:520px){:host{right:5px;bottom:5px}.panel{width:calc(100vw - 10px);max-height:88vh}}
nav{overflow-x:auto;scrollbar-width:thin}.tab{flex:0 0 auto;min-width:58px;white-space:nowrap}
.cog-card{border:1px solid #303d59;border-radius:12px;padding:11px;background:#151e30;margin-top:9px}
.cog-step{border:1px solid #303d59;border-radius:10px;padding:9px;margin-top:7px;background:#111a2b}
.cog-step.active{border-color:#8273ee;box-shadow:inset 3px 0 #8273ee}
.cog-step.done{border-color:#38785f;background:#14271f}
.cog-step-head{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:800}
.cog-num{display:grid;place-items:center;flex:0 0 22px;height:22px;border-radius:7px;background:#2b3150;color:#dcd6ff}
.cog-step p{margin:6px 0 0 29px;color:#aebad2;font-size:10px;line-height:1.5}
.cog-why{margin-top:5px;color:#8292b1;font-size:9px;line-height:1.45}
.cog-progress{height:7px;border-radius:9px;background:#27334c;overflow:hidden;margin-top:8px}.cog-progress span{display:block;height:100%;width:0;background:linear-gradient(90deg,#8273ee,#55c6a1);transition:width .2s}
.cog-memory{display:flex;align-items:center;gap:7px;padding:8px;margin-top:6px;border:1px solid #303d59;border-radius:9px;background:#121b2c}
.cog-memory span{flex:1;min-width:0;font-size:10px;overflow-wrap:anywhere}.cog-memory button{flex:0 0 auto}
.cog-label{font-size:9px;color:#9eabc7;font-weight:800;letter-spacing:.5px;text-transform:uppercase}
:host([data-theme=light]) .cog-card,:host([data-theme=light]) .cog-step,:host([data-theme=light]) .cog-memory{background:#fff;border-color:#dce1ed}
:host([data-theme=light]) .cog-step.done{background:#effaf4;border-color:#b5dfc8}
.cog-action-result{min-height:145px}.cog-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.cog-action-grid .btn{width:100%}.cog-chip{display:inline-block;padding:3px 7px;border:1px solid #485779;border-radius:999px;color:#c8d1e7;font-size:9px}:host([data-theme=light]) .cog-chip{color:#42506a;border-color:#cbd3e3}
@media(max-width:360px){.tab{min-width:54px;padding:8px 5px}.cog-memory{align-items:flex-start;flex-wrap:wrap}}

@media(max-width:640px){
 :host{display:block;box-sizing:border-box;left:0;right:0;top:0;bottom:0;width:100vw;height:100vh;height:100dvh;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
 .panel{width:100%;height:100%;max-height:none;border:0;border-radius:0;box-shadow:none}
 header{min-height:58px;padding:8px 10px;cursor:default;touch-action:none}
 .logo{width:34px;height:34px;flex:0 0 34px}
 .brand{font-size:15px}.version{font-size:9px}
 .icon{width:42px;height:42px;min-width:42px;border-radius:10px;font-size:20px}
 nav{padding:6px;gap:5px;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin}
 .tab{flex:0 0 auto;min-width:68px;min-height:44px;padding:10px 9px;font-size:11px}
 main{flex:1;min-height:0;padding:12px;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
 footer{padding:10px 12px;min-height:36px}
 input,textarea,select{font-size:16px;min-height:44px;padding:11px 12px}
 textarea{min-height:140px;line-height:1.5}
 .btn{min-height:44px;padding:11px 12px;font-size:12px}
 label{font-size:12px;margin-top:12px}
 .eyebrow{font-size:10px}
 .desc{font-size:12px;line-height:1.55}
 .meta,.status,.hint{font-size:11px;line-height:1.5}
 .row{gap:8px}
 .module-grid{grid-template-columns:1fr}
 .module-card{padding:12px}
 .module-card b{font-size:13px}
 .module-card p{min-height:0;font-size:11px}
 .cog-action-grid{grid-template-columns:1fr}
 .cog-card{padding:12px}
 .cog-step p{font-size:11px}
 .cog-why{font-size:10px}
 .cog-memory{flex-wrap:wrap}
 .cog-memory button{min-height:40px}
 .timer{font-size:40px}
}
@media(max-width:360px){
 header{gap:6px;padding-left:8px;padding-right:8px}
 .brand{font-size:13px}
 .version{font-size:8px}
 .icon{width:40px;height:40px;min-width:40px}
 .tab{min-width:64px;padding-left:7px;padding-right:7px}
 .row{flex-direction:column}
 .row>*{width:100%}
}
@media(min-width:641px) and (max-height:600px){
 .panel{max-height:94vh}
}
</style>
<section class="panel" id="panel" role="dialog" aria-label="Painel Waynovo">
<header id="drag"><div class="logo">W</div><div><div class="brand">WAYNOVO</div><div class="version">UNIFIED TOOLKIT · 1.9 · EVIDENCE TUTOR</div></div><div class="spacer"></div>
<button class="icon" id="theme" title="Tema">◐</button><button class="icon" id="min" title="Minimizar">−</button><button class="icon" id="close" title="Fechar">×</button></header>
<nav><button class="tab active" data-tab="study">Estudo</button><button class="tab" data-tab="modules">Módulos</button><button class="tab" data-tab="cards">Cartões</button><button class="tab" data-tab="tools">Texto</button><button class="tab" data-tab="focus">Foco</button><button class="tab" data-tab="ai">IA</button><button class="tab" data-tab="automation">Automação</button><button class="tab" data-tab="bypass">Bypass Lab</button><button class="tab" data-tab="autopilot">Autopilot</button><button class="tab" data-tab="questions">Questões</button><button class="tab" data-tab="cognitive">Cérebro</button></nav>
<main>
<section class="view active" data-view="study"><div class="eyebrow">Laboratório de aprendizagem</div><div class="desc" id="pageInfo">Selecione um trecho visível ou cole seu material.</div>
<label for="source">Material</label><textarea id="source" placeholder="Selecione um texto e toque em Capturar, ou cole aqui..."></textarea><div class="meta" id="count">0 palavras</div>
<label for="mode">Ferramenta</label><select id="mode"><option value="lesson">Lição organizada</option><option value="summary">Resumo estruturado</option><option value="flashcards">Flashcards</option><option value="practice">Exercícios originais</option><option value="checklist">Checklist</option><option value="outline">Mapa de tópicos</option><option value="glossary">Glossário</option></select>
<div class="row"><button class="btn primary" id="generate">Gerar localmente</button><button class="btn" id="capture">Capturar seleção</button></div>
<label for="output">Resultado</label><textarea class="output" id="output" placeholder="Seu material aparecerá aqui."></textarea>
<div class="row"><button class="btn primary" id="copy">Copiar</button><button class="btn" id="download">Salvar TXT</button></div><div class="status" id="studyStatus"></div>
<div class="hint">Crie materiais de aprendizagem originais e confira as informações com a fonte.</div></section>
<section class="view" data-view="cards"><div class="eyebrow">Revisão ativa</div><div class="desc">Gere cartões a partir do material e tente recordar a resposta antes de revelar.</div>
<div class="row"><button class="btn primary" id="makeCards">Criar cartões</button><button class="btn" id="clearCards">Limpar</button></div>
<div class="box center"><div class="meta" id="cardMeta">Nenhum cartão</div><div id="question" style="font-size:14px;font-weight:800;padding:14px 3px">Crie cartões na aba Estudo.</div><div id="answer" style="display:none;text-align:left;font-size:11px;color:#bac5dd;white-space:pre-wrap;border-top:1px solid #34415c;padding-top:10px"></div></div>
<div class="row"><button class="btn soft" id="reveal">Revelar</button><button class="btn primary" id="next">Próximo</button></div><div class="status" id="cardStatus"></div></section>
<section class="view" data-view="tools"><div class="eyebrow">Editor rápido</div><div class="desc">Ferramentas locais para organizar textos.</div>
<label for="editor">Texto</label><textarea id="editor" placeholder="Cole um texto para editar..."></textarea><div class="meta" id="editorCount">0 palavras</div>
<div class="row"><button class="btn" id="trim">Limpar espaços</button><button class="btn" id="titlecase">Capitalizar</button></div>
<div class="row"><button class="btn" id="upper">MAIÚSCULAS</button><button class="btn" id="lower">minúsculas</button></div>
<div class="row"><button class="btn primary" id="copyEditor">Copiar</button><button class="btn" id="saveNote">Salvar nota</button></div><label>Notas neste navegador</label><div id="notes"></div><div class="status" id="toolStatus"></div></section>
<section class="view" data-view="focus"><div class="eyebrow">Sessão de foco</div><div class="desc">Organize blocos de estudo com um temporizador simples.</div>
<label for="duration">Duração</label><select id="duration"><option value="15">15 minutos</option><option value="25" selected>25 minutos</option><option value="35">35 minutos</option><option value="45">45 minutos</option><option value="50">50 minutos</option></select>
<div class="timer" id="timer">25:00</div><div class="meta center" id="timerStatus">Pronto para começar</div><div class="row"><button class="btn primary" id="toggleTimer">Iniciar</button><button class="btn" id="resetTimer">Reiniciar</button></div></section>
<section class="view" data-view="ai"><div class="eyebrow">Assistente opcional</div><div class="desc">Local gratuito por padrão. IA online opcional somente por modelos gratuitos permitidos no gateway.</div>
<label for="endpoint">Endpoint do gateway</label><input id="endpoint" type="url" placeholder="https://seu-worker.workers.dev/generate" autocomplete="off">
<label for="token">Token de acesso do gateway</label><input id="token" type="password" placeholder="Token temporário" autocomplete="off">
<label for="provider">Provedor preferido</label><div class="hint">Local gratuito não precisa de internet, token nem conta. OpenRouter Free é opcional, exige uma chave no gateway e tem limite de uso. OpenAI API é paga e fica bloqueada neste modo.</div><select id="provider">
<option value="local" selected>Local gratuito · offline</option>
<option value="auto">IA online grátis · OpenRouter Free</option>
<option value="openrouter">OpenRouter Free</option>
<option value="openai" disabled>OpenAI API · paga e bloqueada no modo grátis</option>
</select>
<label for="fallback">Fallback automático</label><select id="fallback"><option value="true" selected>Ativado · tentar os outros provedores</option><option value="false">Desativado · somente o preferido</option></select>
<label for="task">Tarefa</label><select id="task"><option value="explain">Explicar conceitos</option><option value="summary">Resumo</option><option value="lesson">Criar lição</option><option value="flashcards">Flashcards</option><option value="practice">Exercícios originais</option><option value="plan">Plano de estudo</option><option value="checklist">Checklist</option><option value="translate">Traduzir</option></select>
<div class="row"><button class="btn primary" id="askAI">Enviar material à IA</button><button class="btn" id="clearToken">Limpar token</button></div><div class="status" id="aiStatus"></div>
<div class="hint">Digite o token do gateway. Configure GEMINI_API_KEY, GROQ_API_KEY e OPENROUTER_API_KEY como secrets no Worker. O conteúdo só é enviado ao clicar.</div></section>
<section class="view" data-view="modules"><div class="eyebrow">Central de automações</div><div class="desc" id="moduleDetect">Detectando a página atual…</div>
<div class="module-grid">
<article class="module-card"><b>WaygroundX</b><p>Transforme enunciados selecionados em explicações e exercícios inéditos.</p><button class="btn primary" data-module="wayground">Analisar questão</button></article>
<article class="module-card"><b>LeiaPR</b><p>Organize trechos de leitura, gere resumo e identifique termos para revisar.</p><button class="btn primary" data-module="leiapr">Guiar leitura</button></article>
<article class="module-card"><b>Redação</b><p>Leve o texto selecionado ao editor para estruturar, revisar e guardar rascunhos.</p><button class="btn primary" data-module="redacao">Abrir editor</button></article>
<article class="module-card"><b>Khan</b><p>Converta um conceito em uma lição curta e prática de recuperação ativa.</p><button class="btn primary" data-module="khan">Estudar conceito</button></article>
<article class="module-card"><b>Alura</b><p>Crie notas de aula e um checklist pessoal a partir do trecho escolhido.</p><button class="btn primary" data-module="alura">Criar notas</button></article>
<article class="module-card"><b>Fubanga · Hub</b><p>Gerencie os módulos internos do Waynovo. Nenhum script remoto será executado.</p><button class="btn primary" data-module="hub">Ver catálogo</button></article>
</div><div class="status" id="moduleStatus">Escolha um módulo. O Waynovo usa somente o texto selecionado ou colado.</div>
<div class="hint">Os módulos são independentes, mas compartilham cartões, notas, editor, temporizador e gateway de IA. Ações em páginas externas permanecem sob seu controle.</div></section>
<section class="view" data-view="autopilot"><div class="eyebrow">Autopilot · monitor automático</div>
<div class="desc">Ao abrir o Waynovo, o monitor começa a observar o texto renderizado e visível nesta página. Ele identifica enunciados, procura evidências no próprio conteúdo e monta rascunhos locais sem enviar nada à página.</div>
<div class="box"><div id="autoState" style="font-size:11px;font-weight:850">ROBÔ ATIVO · varredura local</div><div class="meta">Os números abaixo são desta aba/sessão.</div>
<div class="auto-stats">
<div class="auto-stat"><div class="auto-num" id="autoTime">00:00</div><div class="meta">Tempo com Waynovo aberto</div></div>
<div class="auto-stat"><div class="auto-num" id="autoScans">0</div><div class="meta">Varreduras realizadas</div></div>
<div class="auto-stat"><div class="auto-num" id="autoQuestions">0</div><div class="meta">Questões visíveis detectadas</div></div>
<div class="auto-stat"><div class="auto-num" id="autoDrafts">0</div><div class="meta">Rascunhos sugeridos</div></div>
</div></div>
<div class="row"><button class="btn primary" id="autoScanNow">Varredura agora</button><button class="btn" id="autoToggle">Pausar robô</button><button class="btn" id="autoCopy">Copiar rascunhos</button></div>
<label>Questões encontradas e sugestões</label><div id="autoResults"><div class="meta">O monitor está iniciando a primeira varredura…</div></div>
<div class="hint">O modo local não usa API nem cobra nada. As sugestões são extraídas de trechos visíveis da própria página e precisam ser conferidas. O contador registra questões detectadas, não respostas submetidas ou avaliações concluídas. Conteúdo oculto, campos privados, iframes isolados e botões de resposta são ignorados.</div>
<div class="status" id="autoStatus" aria-live="polite">Inicializando monitor…</div></section>
<section class="view" data-view="questions"><div class="eyebrow">Assistente de questões · WaygroundX-inspired</div><div class="desc">Cole o enunciado e as alternativas para receber uma explicação guiada. O assistente não lê nem responde diretamente em plataformas externas.</div>
<label for="questionText">Enunciado</label><textarea id="questionText" placeholder="Cole aqui o enunciado da questão..."></textarea>
<label for="questionChoices">Alternativas (opcional)</label><textarea id="questionChoices" style="min-height:78px" placeholder="A) ...&#10;B) ...&#10;C) ..."></textarea>
<label for="questionEvidence">Material de apoio (opcional)</label><textarea id="questionEvidence" style="min-height:90px" placeholder="Trechos de apoio podem ser preenchidos automaticamente pelo Autopilot ou colados aqui..."></textarea>
<div class="row"><button class="btn primary" id="prepareQuestion">Preparar análise</button><button class="btn" id="clearQuestion">Limpar</button></div>
<div class="row"><button class="btn primary" id="analyzeQuestionAI">Analisar com IA</button></div>
<div class="hint">A análise é para estudo: explica o raciocínio, compara alternativas e aponta incertezas. A IA só recebe o conteúdo quando você toca em Analisar com IA e o gateway está configurado.</div><div class="status" id="questionStatus"></div></section>
<section class="view" data-view="automation"><div class="eyebrow">Motor de automação · sandbox</div><div class="desc">Monte e execute fluxos em um ambiente fictício isolado. Nenhuma ação é enviada à página ou a serviços externos.</div>
<div class="box"><div style="font-size:11px;font-weight:800;margin-bottom:7px">Estado do ambiente simulado</div><div id="labState" style="font-size:10px;line-height:1.8;color:#b8c5df">Sessão: desconectada<br>Página: início<br>Progresso: 0%<br>Resposta: vazia</div></div>
<label for="flowPreset">Fluxo de demonstração</label><select id="flowPreset"><option value="study">Sessão de estudo guiada</option><option value="navigation">Navegação entre páginas fictícias</option><option value="validation">Teste de validação local</option></select>
<div class="row"><button class="btn primary" id="runFlow">Executar fluxo</button><button class="btn" id="resetLab">Reiniciar sandbox</button></div>
<label>Registro de execução</label><textarea id="labLog" class="output" readonly placeholder="As etapas simuladas aparecerão aqui."></textarea>
<div class="hint">O laboratório testa o motor de etapas, condições e estados usando somente dados em memória. Não realiza login, não altera progresso real e não interage com páginas de terceiros.</div></section><section class="view" data-view="bypass"><div class="eyebrow">Bypass Engine · laboratório controlado</div>
<div class="desc">Teste estratégias de QA, políticas de autorização, limites e falhas em adaptadores locais. O painel é independente e roda sem servidor.</div>
<div class="box"><div style="font-size:11px;font-weight:800">Motor local ativo</div><div class="meta">SEM REDE · SEM SCRIPT REMOTO · APENAS FIXTURES DE TESTE</div><div id="bypassSummary" style="font-size:10px;line-height:1.7;color:#b8c5df;margin-top:7px">4 adaptadores registrados · auditoria da sessão</div></div>
<label for="bypassExample">Cenário rápido</label><select id="bypassExample"><option value="client-deny">Gate cliente · negar baseline</option><option value="client-override">Gate cliente · override QA</option><option value="trusted-spoof">Permissão · payload forjado</option><option value="trusted-grant">Permissão · grant da fixture</option><option value="rate-hit">Limite · tentativas excedidas</option><option value="rate-ok">Limite · abaixo da janela</option><option value="fault-fail">Dependência · falha simulada</option><option value="fault-ok">Dependência · saudável</option></select>
<label for="bypassAdapter">Adaptador de política</label><select id="bypassAdapter"><option value="client-feature-gate">Gate de recurso no cliente · QA elegível</option><option value="trusted-entitlement">Permissão por fixture confiável · protegido</option><option value="rate-limit">Limite de tentativas · fixture</option><option value="fault-tolerance">Tolerância a falhas · fail-closed</option></select>
<label for="bypassEnvironment">Ambiente da fixture</label><select id="bypassEnvironment"><option value="test">Test fixture</option><option value="demo">Demo</option></select>
<label for="bypassContext">Contexto JSON do caso de teste</label><textarea id="bypassContext" style="min-height:112px" spellcheck="false">{
  "fixture": {"mode":"test","trustedGrants":[]},
  "clientPayload": {"featureEnabled":false,"role":"free"}
}</textarea>
<label style="display:flex;align-items:center;gap:7px;font-weight:650"><input id="bypassQaAuthorization" type="checkbox" style="width:auto;margin:0"> Autorizo override QA nesta fixture local de teste</label>
<div class="row"><button class="btn primary" id="bypassBaseline">Executar baseline</button><button class="btn soft" id="bypassOverride">Aplicar override QA</button></div>
<div class="row"><button class="btn primary" id="bypassSuite">Rodar suíte de testes</button><button class="btn" id="bypassExport">Exportar auditoria</button></div>
<label for="bypassLog">Resultado e trilha de auditoria</label><textarea id="bypassLog" class="output" readonly placeholder="As decisões e os testes executados aparecerão aqui."></textarea>
<div class="row"><button class="btn" id="bypassClear">Limpar auditoria</button><button class="btn" id="bypassResetContext">Restaurar cenário</button></div>
<div class="status" id="bypassStatus"></div>
<div class="hint">O override QA só é aceito por um adaptador <b>owned-lab</b> explicitamente elegível, em ambiente test e após marcar a autorização. Adaptadores de fixture confiável ignoram privilégios enviados pelo cliente. Nenhum adaptador faz chamadas de rede ou toca em serviços externos.</div></section>
<section class="view" data-view="cognitive"><div class="eyebrow">Cognitive Engine · planejamento local</div>
<div class="desc">Dê um objetivo ao Waynovo. Ele organiza um plano, acompanha as etapas, registra memórias escolhidas por você e verifica critérios. O modo local usa regras transparentes; a análise por modelo é opcional.</div>
<label for="cogGoal">Qual é o objetivo?</label><textarea id="cogGoal" style="min-height:76px" maxlength="1200" placeholder="Ex.: Quero aprender fotossíntese e conseguir explicar o processo com minhas palavras."></textarea>
<label for="cogContext">Contexto ou material de apoio (opcional)</label><textarea id="cogContext" style="min-height:86px" maxlength="7000" placeholder="Cole informações relevantes, requisitos ou critérios de conclusão..."></textarea>
<div class="row"><button class="btn" id="cogUseMaterial">Usar material da aba Estudo</button><button class="btn primary" id="cogPlan">Criar plano</button></div>
<div class="cog-card"><div class="cog-label">Diagnóstico do objetivo</div><div id="cogRationale" style="font-size:10px;line-height:1.55;color:#c1cbe0;margin-top:6px">Seu diagnóstico aparecerá aqui.</div><div class="meta" id="cogEvidence">Nenhuma análise criada.</div></div>
<div class="cog-card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:11px">Plano de execução</b><span class="meta" id="cogProgress">0 etapas</span></div><div class="cog-progress"><span id="cogProgressBar"></span></div><div id="cogSteps"><div class="meta">Crie um plano para ver as etapas.</div></div>
<div class="row"><button class="btn primary" id="cogNext" disabled>Concluir etapa atual</button><button class="btn" id="cogReset" disabled>Reiniciar plano</button></div>
<div class="row"><button class="btn" id="cogSaveMemory" disabled>Guardar na memória</button><button class="btn" id="cogCopyPlan" disabled>Copiar plano</button></div><div class="status" id="cogStatus"></div></div>
<div class="cog-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:11px">Action Lab · execução assistida</b><span class="cog-chip">sem ações externas</span></div>
<div class="desc">Produza uma entrega para a etapa atual e audite o resultado. Cada chamada usa o provedor/fallback escolhido na aba IA e exige seu clique.</div>
<div class="meta" id="cogCurrentStep">Crie um plano para começar.</div>
<div class="cog-action-grid"><button class="btn primary" id="cogRunStep" disabled>Executar etapa com IA</button><button class="btn" id="cogVerifyStep" disabled>Auditar resultado</button></div>
<label for="cogStepResult">Resultado produzido</label><textarea id="cogStepResult" class="cog-action-result" placeholder="A entrega aparecerá aqui. Você pode editá-la antes da auditoria."></textarea>
<label for="cogAuditResult">Auditoria e pontos a corrigir</label><textarea id="cogAuditResult" class="cog-action-result" readonly placeholder="A auditoria aponta critérios atendidos, lacunas e incertezas."></textarea>
<div class="row"><button class="btn" id="cogSendResult" disabled>Enviar para Estudo</button><button class="btn" id="cogSaveResult" disabled>Guardar plano + entrega</button></div>
<div class="status" id="cogActionStatus"></div></div>
<div class="cog-card"><div class="cog-label">Análise com modelo · opcional</div><div class="desc">Usa o endpoint e o token configurados na aba IA. O texto só é enviado quando você clicar; podem existir limites ou custos do provedor.</div><div class="row"><button class="btn primary" id="cogAskAI">Analisar objetivo com IA</button></div><textarea id="cogAIResult" class="output" readonly placeholder="A análise do gateway aparecerá aqui."></textarea></div>
<div class="cog-card"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><b style="font-size:11px">Memória deste navegador</b><button class="btn" id="cogClearMemory">Apagar memória</button></div><div class="desc">Nada é sincronizado. Somente planos salvos explicitamente aparecem aqui.</div><div id="cogMemories"><div class="meta">Nenhuma memória salva.</div></div></div>
<div class="hint">Limite importante: o planejador local não é um modelo de linguagem e não executa ações em sites externos. Ele organiza o trabalho e acompanha o que você marca como concluído. Use adaptadores próprios e permissões explícitas para integrações futuras.</div></section>
</main><footer><span id="site">Waynovo · local-first</span><span>Esc fecha</span></footer></section>
`;
const $=id=>root.getElementById(id);
const KEY='waynovo.unified.v1', ENDPOINT='waynovo.gateway.endpoint', PROVIDER='waynovo.gateway.provider', FALLBACK='waynovo.gateway.fallback';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(_){return {};}};
const state=read();state.cards=Array.isArray(state.cards)?state.cards.filter(x=>x&&typeof x.front==='string'&&typeof x.back==='string').slice(0,300):[];state.notes=Array.isArray(state.notes)?state.notes.filter(x=>x&&typeof x.text==='string').slice(-100):[];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){status('toolStatus','Armazenamento indisponível ou cheio.');}};
function status(id,msg){const el=$(id);if(el)el.textContent=msg;}
const selection=()=>{try{return String(window.getSelection?window.getSelection():'').trim();}catch(_){return '';}};
const title=String(document.title||'Página').slice(0,140);
$('pageInfo').textContent=title+' · '+location.hostname+' — selecione ou cole o trecho desejado.';
$('site').textContent='Waynovo · '+location.hostname;
$('source').value=selection();
try{$('endpoint').value=sessionStorage.getItem(ENDPOINT)||'';$('provider').value=sessionStorage.getItem(PROVIDER)||'local';$('fallback').value=sessionStorage.getItem(FALLBACK)||'true';}catch(_){}
$('provider').addEventListener('change',()=>{try{sessionStorage.setItem(PROVIDER,$('provider').value);}catch(_){}});
$('fallback').addEventListener('change',()=>{try{sessionStorage.setItem(FALLBACK,$('fallback').value);}catch(_){}});
const words=s=>s.trim()?s.trim().split(/\s+/).length:0;
$('source').addEventListener('input',()=>{$('count').textContent=words($('source').value)+' palavras · '+$('source').value.length+' caracteres';});
$('source').dispatchEvent(new Event('input'));
function pieces(s){const p=s.split(/\n{2,}/).map(x=>x.trim()).filter(Boolean);const q=s.split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(x=>x.length>25);return (p.length>1?p:q.length?q:[s]).slice(0,20);}
function terms(s){const stop=new Set('sobre entre quando como para pela pelo pelos pelas uma umas uns dos das esse essa isso isto também então muito mais menos cada onde porque seus suas ser ter está são foi foram com sem que por das dos nos nas aos'.split(' '));const m=new Map();(s.toLocaleLowerCase('pt-BR').match(/[a-zÀ-ÿ]{4,}/g)||[]).forEach(w=>{if(!stop.has(w))m.set(w,(m.get(w)||0)+1);});return [...m].sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0]);}
function local(kind,s){const p=pieces(s),t=terms(s),h='WAYNOVO · '+title;
if(kind==='summary')return [h,'',...p.slice(0,12).map((x,i)=>(i+1)+'. '+x),'','CONCEITOS-CHAVE',...t.map(x=>'• '+x),'','Confira a fidelidade à fonte.'].join('\n');
if(kind==='flashcards')return [h,'',...p.slice(0,12).map((x,i)=>'CARTÃO '+(i+1)+'\nPergunta: Explique a ideia deste trecho com suas palavras.\nApoio: '+x)].join('\n\n');
if(kind==='practice')return [h,'','EXERCÍCIOS ORIGINAIS','1. Qual é a ideia central do material?','2. Explique um conceito importante sem copiar a fonte.','3. Crie um exemplo próprio.','4. Compare dois tópicos.','5. Que dúvida ainda precisa investigar?','','TÓPICOS PARA PRATICAR',...p.slice(0,8)].join('\n');
if(kind==='checklist')return [h,'',...p.slice(0,15).map((x,i)=>'[ ] Etapa '+(i+1)+': '+x),'[ ] Explicar os conceitos sem consultar.','[ ] Revisar em 1, 3 e 7 dias.'].join('\n');
if(kind==='outline')return [h,'','MAPA DE TÓPICOS',...p.slice(0,15).map((x,i)=>(i+1)+'. '+x.split(/[.!?]/)[0].slice(0,140)),'','PALAVRAS-CHAVE',...t.map(x=>'• '+x)].join('\n');
if(kind==='glossary')return [h,'','GLOSSÁRIO PARA COMPLETAR',...t.map((x,i)=>(i+1)+'. '+x+': defina com suas palavras.')].join('\n');
return [h,'','OBJETIVO','Compreender e explicar as ideias com autonomia.','','CONTEÚDO EM ETAPAS',...p.slice(0,12).map((x,i)=>(i+1)+'. '+x),'','CONCEITOS-CHAVE',...t.map(x=>'• '+x),'','RECUPERAÇÃO ATIVA','• Explique sem consultar.','• Crie um exemplo próprio.','• Registre uma dúvida.','','REVISÃO ESPAÇADA','Revise hoje, amanhã, em 3 dias e em 7 dias.'].join('\n');}
$('generate').addEventListener('click',()=>{const s=$('source').value.trim();if(!s)return status('studyStatus','Selecione ou cole material.');$('output').value=local($('mode').value,s);status('studyStatus','Material criado localmente. Revise com a fonte.');});
$('capture').addEventListener('click',()=>{const s=selection();if(!s)return status('studyStatus','Nenhum texto selecionado. Cole o trecho manualmente.');$('source').value=s;$('source').dispatchEvent(new Event('input'));status('studyStatus','Seleção capturada.');});
async function copy(s){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(s);return true;}}catch(_){}const a=document.createElement('textarea');a.value=s;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy');}catch(_){}a.remove();return ok;}
$('copy').addEventListener('click',async()=>{const s=$('output').value;if(!s)return status('studyStatus','Gere um resultado antes.');status('studyStatus',await copy(s)?'Copiado.':'Cópia bloqueada pelo navegador.');});
$('download').addEventListener('click',()=>{const s=$('output').value;if(!s)return status('studyStatus','Gere um resultado antes.');const u=URL.createObjectURL(new Blob([s],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='waynovo-estudo.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);});
let cardIndex=0,revealed=false;
function drawCard(){const a=state.cards;if(!a.length){$('cardMeta').textContent='Nenhum cartão salvo';$('question').textContent='Crie cartões a partir do material da aba Estudo.';$('answer').style.display='none';return;}cardIndex=(cardIndex+a.length)%a.length;$('cardMeta').textContent='Cartão '+(cardIndex+1)+' de '+a.length;$('question').textContent=a[cardIndex].front;$('answer').textContent=a[cardIndex].back;$('answer').style.display=revealed?'block':'none';$('reveal').textContent=revealed?'Ocultar':'Revelar resposta';}
$('makeCards').addEventListener('click',()=>{const s=$('source').value.trim();if(!s)return status('cardStatus','Adicione material na aba Estudo.');state.cards=pieces(s).slice(0,18).map((p,i)=>({front:'Explique a ideia central do trecho '+(i+1)+'.',back:p}));cardIndex=0;revealed=false;save();drawCard();status('cardStatus',state.cards.length+' cartões salvos localmente.');});
$('clearCards').addEventListener('click',()=>{state.cards=[];save();drawCard();status('cardStatus','Cartões removidos.');});
$('reveal').addEventListener('click',()=>{if(!state.cards.length)return;revealed=!revealed;drawCard();});
$('next').addEventListener('click',()=>{if(!state.cards.length)return;cardIndex++;revealed=false;drawCard();});drawCard();
$('editor').addEventListener('input',()=>{$('editorCount').textContent=words($('editor').value)+' palavras · '+$('editor').value.length+' caracteres';});
$('trim').addEventListener('click',()=>{$('editor').value=$('editor').value.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();$('editor').dispatchEvent(new Event('input'));status('toolStatus','Espaços extras removidos.');});
$('titlecase').addEventListener('click',()=>{$('editor').value=$('editor').value.toLocaleLowerCase('pt-BR').replace(/(^|[.!?]\s+)([a-zà-ÿ])/g,(m,a,b)=>a+b.toLocaleUpperCase('pt-BR'));$('editor').dispatchEvent(new Event('input'));});
$('upper').addEventListener('click',()=>{$('editor').value=$('editor').value.toLocaleUpperCase('pt-BR');$('editor').dispatchEvent(new Event('input'));});
$('lower').addEventListener('click',()=>{$('editor').value=$('editor').value.toLocaleLowerCase('pt-BR');$('editor').dispatchEvent(new Event('input'));});
$('copyEditor').addEventListener('click',async()=>{const s=$('editor').value;if(!s)return status('toolStatus','Nada para copiar.');status('toolStatus',await copy(s)?'Copiado.':'Cópia bloqueada.');});
function drawNotes(){const list=$('notes');list.replaceChildren();if(!state.notes.length){const p=document.createElement('div');p.className='meta';p.textContent='Nenhuma nota salva.';list.appendChild(p);return;}state.notes.slice().reverse().forEach(note=>{const row=document.createElement('div');row.className='noteitem';const info=document.createElement('div');info.className='noteinfo';const name=document.createElement('div');name.className='notetitle';name.textContent=note.text.split(/\s+/).slice(0,8).join(' ').slice(0,65);const date=document.createElement('div');date.className='notedate';date.textContent=note.date;info.append(name,date);const open=document.createElement('button');open.className='btn';open.textContent='Abrir';open.addEventListener('click',()=>{$('editor').value=note.text;$('editor').dispatchEvent(new Event('input'));});const del=document.createElement('button');del.className='btn';del.textContent='×';del.addEventListener('click',()=>{state.notes=state.notes.filter(x=>x!==note);save();drawNotes();});row.append(info,open,del);list.appendChild(row);});}
$('saveNote').addEventListener('click',()=>{const s=$('editor').value.trim();if(!s)return status('toolStatus','Escreva algo antes de salvar.');state.notes.push({text:s.slice(0,12000),date:new Date().toLocaleString('pt-BR')});state.notes=state.notes.slice(-100);save();drawNotes();status('toolStatus','Nota salva neste navegador.');});drawNotes();
let remain=25*60,interval=null;function drawTimer(){$('timer').textContent=String(Math.floor(remain/60)).padStart(2,'0')+':'+String(remain%60).padStart(2,'0');}
function resetTimer(){if(interval)clearInterval(interval);interval=null;remain=Number($('duration').value)*60;$('toggleTimer').textContent='Iniciar';$('timerStatus').textContent='Pronto para começar';drawTimer();}
$('duration').addEventListener('change',resetTimer);
$('toggleTimer').addEventListener('click',()=>{if(interval){clearInterval(interval);interval=null;$('toggleTimer').textContent='Continuar';$('timerStatus').textContent='Pausado';return;}if(remain<=0)resetTimer();$('toggleTimer').textContent='Pausar';$('timerStatus').textContent='Foco em andamento';interval=setInterval(()=>{remain--;drawTimer();if(remain<=0){clearInterval(interval);interval=null;$('toggleTimer').textContent='Iniciar';$('timerStatus').textContent='Sessão concluída. Faça uma pausa.';}},1000);});
$('resetTimer').addEventListener('click',resetTimer);drawTimer();
try{$('endpoint').value=sessionStorage.getItem(ENDPOINT)||'';}catch(_){}
$('endpoint').addEventListener('change',()=>{try{sessionStorage.setItem(ENDPOINT,$('endpoint').value.trim());}catch(_){}});
$('clearToken').addEventListener('click',()=>{$('token').value='';status('aiStatus','Token apagado do campo.');});
$('askAI').addEventListener('click',async()=>{
 const content=$('source').value.trim(),provider=$('provider').value,task=$('task').value;
 if(!content)return status('aiStatus','Adicione material na aba Estudo.');
 if(provider==='local'){
  const localKinds={explain:'lesson',summary:'summary',lesson:'lesson',flashcards:'flashcards',practice:'practice',plan:'outline',checklist:'checklist',translate:'glossary'};
  $('output').value=local(localKinds[task]||'lesson',content);
  status('studyStatus','Modo Local gratuito: resultado criado no navegador. Nenhum conteúdo foi enviado.');
  status('aiStatus','Concluído offline · sem API, sem token e sem cobrança.');
  activateTab('study');
  return;
 }
 const endpoint=$('endpoint').value.trim(),token=$('token').value.trim();
 if(!endpoint||!token)return status('aiStatus','Para provedores externos, configure endpoint e token. O modo Local funciona sem isso.');
 let u;try{u=new URL(endpoint);}catch(_){return status('aiStatus','Endpoint inválido.');}
 if(u.protocol!=='https:'&&u.hostname!=='localhost'&&u.hostname!=='127.0.0.1')return status('aiStatus','Use HTTPS, exceto em localhost.');
 const btn=$('askAI');btn.disabled=true;const old=btn.textContent;btn.textContent='Enviando…';
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),55000);
 try{
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({task,content,pageTitle:title,provider,fallback:$('fallback').value!=='false'}),signal:controller.signal});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||'Gateway HTTP '+response.status);
  if(typeof data.text!=='string'||!data.text.trim())throw new Error('Resposta vazia do gateway.');
  $('output').value=data.text.trim();
  const usage=data.usage?' · '+usage.inputTokens+' entrada / '+usage.outputTokens+' saída tokens':'';
  status('aiStatus','Resposta via '+(data.provider||provider)+' / '+(data.model||'modelo')+(data.fallbackUsed?' · fallback usado':'')+usage+'. Revise o resultado.');
  activateTab('study');
 }catch(error){status('aiStatus',error.name==='AbortError'?'Tempo limite excedido.':error.message||'Falha no gateway.');}
 finally{clearTimeout(timer);btn.disabled=false;btn.textContent=old;}
});
const moduleNames={wayground:'WaygroundX',leiapr:'LeiaPR',redacao:'Redação',khan:'Khan',alura:'Alura'};
const hostName=String(location.hostname||'').toLowerCase();
const detected=hostName.includes('wayground')||hostName.includes('quizizz')?'WaygroundX':hostName.includes('leia')?'LeiaPR':hostName.includes('khanacademy')?'Khan':hostName.includes('alura')?'Alura':'';
$('moduleDetect').textContent=detected?'Página reconhecida: '+detected+'. Selecione um módulo para trabalhar com o trecho desejado.':'Página: '+hostName+'. Módulos disponíveis em modo manual.';
function activateTab(name){const b=root.querySelector('[data-tab="'+name+'"]');if(b)b.click();}
root.querySelectorAll('[data-module]').forEach(btn=>btn.addEventListener('click',()=>{
 const key=btn.dataset.module,selected=selection(),content=selected||$('source').value.trim();
 if(key==='hub'){$('moduleStatus').textContent='Catálogo local: WaygroundX · LeiaPR · Redação · Khan · Alura. Os módulos são código interno do Waynovo; importação/execução de scripts remotos está desativada.';return;}
 if(!content){$('moduleStatus').textContent='Selecione um trecho visível na página ou cole o material na aba Estudo primeiro.';activateTab('study');$('source').focus();return;}
 if(key==='redacao'){$('editor').value=content;$('editor').dispatchEvent(new Event('input'));status('toolStatus','Texto enviado ao editor pelo módulo Redação.');activateTab('tools');$('editor').focus();$('moduleStatus').textContent='Rascunho carregado no editor local.';return;}
 $('source').value=content;$('source').dispatchEvent(new Event('input'));
 const config={wayground:{mode:'practice',task:'practice',message:'Enunciado preparado para explicação e prática inédita.'},leiapr:{mode:'summary',task:'summary',message:'Trecho preparado para resumo e leitura guiada.'},khan:{mode:'lesson',task:'explain',message:'Conceito preparado para uma lição de revisão.'},alura:{mode:'checklist',task:'checklist',message:'Trecho preparado para notas e checklist de aula.'}};
 const item=config[key];if(!item)return;
 $('mode').value=item.mode;$('task').value=item.task;$('output').value=local(item.mode,content);
 status('studyStatus',item.message+' Revise o resultado com a fonte.');
 $('moduleStatus').textContent=moduleNames[key]+' ativado · '+item.message;
 activateTab('study');$('output').focus();
}));
const lab={session:false,page:'início',progress:0,answer:''};
function drawLab(){ $('labState').innerHTML='Sessão: '+(lab.session?'conectada (fictícia)':'desconectada')+'<br>Página: '+lab.page+'<br>Progresso: '+lab.progress+'%<br>Resposta: '+(lab.answer||'vazia'); }
function runLab(){
 const flows={
 study:[['Abrir ambiente de demonstração',()=>{lab.page='painel de estudo';}],['Criar sessão fictícia',()=>{lab.session=true;}],['Abrir atividade de exemplo',()=>{lab.page='atividade de treino';}],['Registrar resposta de teste',()=>{lab.answer='resposta demonstrativa';}],['Atualizar progresso simulado',()=>{lab.progress=40;}],['Concluir etapa de laboratório',()=>{lab.progress=100;}]],
 navigation:[['Abrir página inicial',()=>{lab.page='início';}],['Navegar para biblioteca',()=>{lab.page='biblioteca';}],['Abrir material de exemplo',()=>{lab.page='material demonstrativo';}],['Voltar ao painel',()=>{lab.page='painel de estudo';}]],
 validation:[['Verificar sessão',()=>{if(!lab.session)throw new Error('Sessão fictícia ausente');}],['Validar campo de resposta',()=>{if(!lab.answer)throw new Error('Resposta de teste vazia');}],['Checar estado de progresso',()=>{if(lab.progress<0||lab.progress>100)throw new Error('Progresso fora do intervalo');}]]
 };
 const log=$('labLog');log.value='[Waynovo Sandbox] Início do fluxo: '+$('flowPreset').value+'\n';
 for(const [name,action] of flows[$('flowPreset').value]){
  try{action();log.value+='✓ '+name+'\n';}
  catch(err){log.value+='✕ '+name+' — '+err.message+'\n';break;}
 }
 drawLab();log.value+='\nEstado final: '+lab.page+' · '+lab.progress+'% · '+(lab.session?'sessão ativa':'sem sessão');
}
$('runFlow').addEventListener('click',runLab);
$('resetLab').addEventListener('click',()=>{lab.session=false;lab.page='início';lab.progress=0;lab.answer='';$('labLog').value='Sandbox reiniciado. Nenhuma alteração externa foi realizada.';drawLab();});
drawLab();

const bypassEngine = (() => {
 const registry=new Map(),audit=[];
 const MAX_CONTEXT=16384,MAX_AUDIT=300;
 function clone(value){return JSON.parse(JSON.stringify(value));}
 function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.keys(value).forEach(k=>freeze(value[k]));Object.freeze(value);}return value;}
 function register(adapter){
  if(!adapter||typeof adapter!=='object'||adapter.scope!=='owned-lab'||typeof adapter.evaluate!=='function')throw new Error('Adaptador inválido: somente owned-lab com evaluate(context).');
  if(!/^[a-z0-9][a-z0-9-]{1,63}$/.test(String(adapter.id||'')))throw new Error('ID de adaptador inválido.');
  if(registry.has(adapter.id))throw new Error('Adaptador duplicado: '+adapter.id);
  if(!['client','fixture'].includes(adapter.authority))throw new Error('Autoridade de adaptador inválida.');
  registry.set(adapter.id,Object.freeze({id:adapter.id,name:String(adapter.name||adapter.id),scope:adapter.scope,authority:adapter.authority,qaOverride:adapter.qaOverride===true,risk:adapter.risk||'medium',evaluate:adapter.evaluate}));
 }
 function normalize(context){
  if(!context||typeof context!=='object'||Array.isArray(context))throw new Error('Contexto precisa ser um objeto JSON.');
  const raw=JSON.stringify(context);if(raw.length>MAX_CONTEXT)throw new Error('Contexto excede 16 KB.');
  const copy=JSON.parse(raw);copy.environment=copy.environment||'test';
  if(!['test','demo'].includes(copy.environment))throw new Error('Ambiente precisa ser test ou demo.');
  if(!copy.fixture||typeof copy.fixture!=='object'||Array.isArray(copy.fixture))copy.fixture={};
  if(!copy.clientPayload||typeof copy.clientPayload!=='object'||Array.isArray(copy.clientPayload))copy.clientPayload={};
  if(!copy.authorization||typeof copy.authorization!=='object'||Array.isArray(copy.authorization))copy.authorization={};
  return freeze(copy);
 }
 function run(adapterId,context,strategy){
  const adapter=registry.get(adapterId);if(!adapter)throw new Error('Adaptador não encontrado.');
  const mode=strategy||'baseline';if(mode!=='baseline'&&mode!=='qa-override')throw new Error('Estratégia desconhecida.');
  const safe=normalize(context);let baseline,errorMessage='';
  try{
   const result=adapter.evaluate(safe);if(!result||typeof result.allowed!=='boolean')throw new Error('evaluate deve retornar allowed booleano.');
   baseline={allowed:result.allowed,reason:String(result.reason||'Sem justificativa.'),evidence:String(result.evidence||''),obligations:Array.isArray(result.obligations)?result.obligations.slice(0,8):[]};
  }catch(error){errorMessage=String(error&&error.message||'Erro desconhecido').slice(0,180);baseline={allowed:false,reason:'Falha segura: avaliação interrompida; acesso negado.',evidence:'evaluation-error',obligations:[]};}
  let allowed=baseline.allowed,reason=baseline.reason,overridden=false,overrideRefusal='';
  if(mode==='qa-override'){
   const eligible=adapter.scope==='owned-lab'&&adapter.authority==='client'&&adapter.qaOverride===true&&safe.environment==='test'&&safe.authorization.qaOverride===true;
   if(eligible){allowed=true;overridden=!baseline.allowed;reason='Override QA local aplicado em fixture test com autorização explícita.';}
   else{overrideRefusal='Override recusado: exige adaptador elegível, ambiente test e autorização explícita.';reason+=' '+overrideRefusal;}
  }
  const record={id:String(Date.now())+'-'+Math.random().toString(36).slice(2,7),timestamp:new Date().toISOString(),adapterId:adapter.id,adapterName:adapter.name,strategy:mode,environment:safe.environment,baselineAllowed:baseline.allowed,allowed,outcome:allowed?'ALLOW':'DENY',overridden,overrideRefusal,reason:reason.slice(0,360),evidence:baseline.evidence.slice(0,100),obligations:baseline.obligations.map(x=>String(x).slice(0,100)),evaluationError:errorMessage,durationMs:0,risk:adapter.risk};
  audit.push(record);if(audit.length>MAX_AUDIT)audit.splice(0,audit.length-MAX_AUDIT);
  return clone(record);
 }
 function restoreAudit(items){if(!Array.isArray(items))return;items.slice(-MAX_AUDIT).forEach(item=>{if(item&&typeof item.timestamp==='string'&&typeof item.adapterId==='string'&&typeof item.allowed==='boolean'&&typeof item.reason==='string')audit.push({...item});});if(audit.length>MAX_AUDIT)audit.splice(0,audit.length-MAX_AUDIT);}
 function list(){return [...registry.values()].map(a=>({id:a.id,name:a.name,authority:a.authority,qaOverride:a.qaOverride,risk:a.risk}));}
 function getAudit(){return clone(audit);}
 function clearAudit(){audit.length=0;}
 function exportAudit(){return JSON.stringify({product:'Waynovo Bypass Engine',version:'1.3',environment:'local-lab',exportedAt:new Date().toISOString(),events:getAudit()},null,2);}
 const suiteCases=[
  {name:'Gate cliente nega quando flag está desligada',id:'client-feature-gate',strategy:'baseline',expected:false,context:{environment:'test',clientPayload:{featureEnabled:false}}},
  {name:'Gate cliente permite quando flag local está ligada',id:'client-feature-gate',strategy:'baseline',expected:true,context:{environment:'test',clientPayload:{featureEnabled:true}}},
  {name:'Override exige autorização explícita',id:'client-feature-gate',strategy:'qa-override',expected:false,context:{environment:'test',authorization:{qaOverride:false},clientPayload:{featureEnabled:false}}},
  {name:'Override autorizado só em test',id:'client-feature-gate',strategy:'qa-override',expected:true,context:{environment:'test',authorization:{qaOverride:true},clientPayload:{featureEnabled:false}}},
  {name:'Override é recusado em demo',id:'client-feature-gate',strategy:'qa-override',expected:false,context:{environment:'demo',authorization:{qaOverride:true},clientPayload:{featureEnabled:false}}},
  {name:'Payload cliente não forja grant confiável',id:'trusted-entitlement',strategy:'baseline',expected:false,context:{environment:'test',fixture:{trustedGrants:[]},clientPayload:{role:'admin',qaOverride:true}}},
  {name:'Grant da fixture confiável autoriza',id:'trusted-entitlement',strategy:'baseline',expected:true,context:{environment:'test',fixture:{trustedGrants:['premium-reports']},clientPayload:{role:'free'}}},
  {name:'Rate limit nega ao atingir limite',id:'rate-limit',strategy:'baseline',expected:false,context:{environment:'test',fixture:{attempts:3,limit:3},clientPayload:{attempts:0}}},
  {name:'Rate limit permite abaixo do limite',id:'rate-limit',strategy:'baseline',expected:true,context:{environment:'test',fixture:{attempts:1,limit:3},clientPayload:{attempts:99}}},
  {name:'Falha de dependência termina em negação segura',id:'fault-tolerance',strategy:'baseline',expected:false,context:{environment:'test',fixture:{simulateFailure:true}}},
  {name:'Dependência saudável passa',id:'fault-tolerance',strategy:'baseline',expected:true,context:{environment:'test',fixture:{healthy:true}}}
 ];
 function runSuite(){const results=suiteCases.map(test=>{const actual=run(test.id,test.context,test.strategy);return {name:test.name,expected:test.expected?'ALLOW':'DENY',actual:actual.outcome,passed:actual.allowed===test.expected,reason:actual.reason};});return {passed:results.filter(x=>x.passed).length,total:results.length,results};}
 register({id:'client-feature-gate',name:'Gate de recurso no cliente',scope:'owned-lab',authority:'client',qaOverride:true,risk:'high',evaluate:({clientPayload})=>({allowed:clientPayload.featureEnabled===true,reason:clientPayload.featureEnabled===true?'A flag local está ativa.':'A flag local está desligada.',evidence:'client-feature-flag'})});
 register({id:'trusted-entitlement',name:'Permissão por fixture confiável',scope:'owned-lab',authority:'fixture',qaOverride:false,risk:'low',evaluate:({fixture})=>{const grants=Array.isArray(fixture.trustedGrants)?fixture.trustedGrants:[];const allowed=grants.includes('premium-reports');return {allowed,reason:allowed?'Grant premium-reports encontrado na fixture.':'Grant ausente; role e flags do cliente são ignorados.',evidence:'trusted-fixture'};}});
 register({id:'rate-limit',name:'Janela de tentativas simulada',scope:'owned-lab',authority:'fixture',qaOverride:false,risk:'medium',evaluate:({fixture})=>{const attempts=Number(fixture.attempts),limit=Number(fixture.limit);const a=Number.isFinite(attempts)&&attempts>=0?attempts:0;const l=Number.isFinite(limit)&&limit>0?Math.min(limit,1000):3;const allowed=a<l;return {allowed,reason:allowed?'Abaixo do limite da fixture.':'Limite da fixture atingido.',evidence:'rate-limit-fixture',obligations:allowed?['Contabilizar tentativa no laboratório']:['Aguardar a janela configurada']};}});
 register({id:'fault-tolerance',name:'Falha de dependência controlada',scope:'owned-lab',authority:'fixture',qaOverride:false,risk:'low',evaluate:({fixture})=>{if(fixture.simulateFailure===true)throw new Error('Falha injetada intencionalmente no laboratório.');const allowed=fixture.healthy===true;return {allowed,reason:allowed?'Dependência de teste saudável.':'Dependência de teste indisponível.',evidence:'fault-fixture'};}});
 return {register,run,runSuite,getAudit,clearAudit,restoreAudit,exportAudit,list};
})();
const BYPASS_AUDIT_KEY='waynovo.bypass.audit.v1';
try{bypassEngine.restoreAudit(JSON.parse(sessionStorage.getItem(BYPASS_AUDIT_KEY)||'[]'));}catch(_){}
const bypassExamples={
 'client-deny':{adapter:'client-feature-gate',strategy:'baseline',environment:'test',context:{fixture:{},clientPayload:{featureEnabled:false}}},
 'client-override':{adapter:'client-feature-gate',strategy:'qa-override',environment:'test',authorized:true,context:{fixture:{},clientPayload:{featureEnabled:false}}},
 'trusted-spoof':{adapter:'trusted-entitlement',strategy:'baseline',environment:'test',context:{fixture:{trustedGrants:[]},clientPayload:{role:'admin',qaOverride:true,featureEnabled:true}}},
 'trusted-grant':{adapter:'trusted-entitlement',strategy:'baseline',environment:'test',context:{fixture:{trustedGrants:['premium-reports']},clientPayload:{role:'free'}}},
 'rate-hit':{adapter:'rate-limit',strategy:'baseline',environment:'test',context:{fixture:{attempts:3,limit:3},clientPayload:{attempts:0}}},
 'rate-ok':{adapter:'rate-limit',strategy:'baseline',environment:'test',context:{fixture:{attempts:1,limit:3},clientPayload:{attempts:99}}},
 'fault-fail':{adapter:'fault-tolerance',strategy:'baseline',environment:'test',context:{fixture:{simulateFailure:true}}},
 'fault-ok':{adapter:'fault-tolerance',strategy:'baseline',environment:'test',context:{fixture:{healthy:true}}}
};
function bypassPersistAudit(){try{sessionStorage.setItem(BYPASS_AUDIT_KEY,JSON.stringify(bypassEngine.getAudit().slice(-100)));}catch(_){}}
function bypassReadContext(){
 let parsed;try{parsed=JSON.parse($('bypassContext').value);}catch(_){throw new Error('JSON inválido. Revise aspas, vírgulas e chaves.');}
 if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Contexto precisa ser um objeto JSON.');
 parsed.environment=$('bypassEnvironment').value;
 parsed.authorization=parsed.authorization&&typeof parsed.authorization==='object'?parsed.authorization:{};
 parsed.authorization.qaOverride=$('bypassQaAuthorization').checked;
 return parsed;
}
function bypassAppend(lines){const current=$('bypassLog').value;$('bypassLog').value=(current?current+'\n':'')+lines.join('\n');$('bypassLog').scrollTop=$('bypassLog').scrollHeight;}
function bypassRun(strategy){
 try{
  const record=bypassEngine.run($('bypassAdapter').value,bypassReadContext(),strategy);bypassPersistAudit();
  bypassAppend(['['+record.timestamp+'] '+record.adapterName+' · '+record.strategy,'Decisão: '+record.outcome+' · baseline: '+(record.baselineAllowed?'ALLOW':'DENY')+' · override: '+(record.overridden?'APLICADO':'não aplicado'),'Motivo: '+record.reason,'']);
  status('bypassStatus','Execução concluída · '+record.outcome+'.');
 }catch(error){status('bypassStatus',error.message||'Falha ao executar o adaptador.');}
}
function bypassLoadExample(){
 const example=bypassExamples[$('bypassExample').value];if(!example)return;
 $('bypassAdapter').value=example.adapter;$('bypassEnvironment').value=example.environment;
 $('bypassContext').value=JSON.stringify(example.context,null,2);$('bypassQaAuthorization').checked=Boolean(example.authorized);
 $('bypassStatus').textContent='Cenário carregado. Estratégia sugerida: '+example.strategy+'.';
}
$('bypassExample').addEventListener('change',bypassLoadExample);
$('bypassBaseline').addEventListener('click',()=>bypassRun('baseline'));
$('bypassOverride').addEventListener('click',()=>bypassRun('qa-override'));
$('bypassSuite').addEventListener('click',()=>{
 const suite=bypassEngine.runSuite(),lines=['SUÍTE AUTOMÁTICA · '+suite.passed+'/'+suite.total+' TESTES PASSARAM'];
 suite.results.forEach((item,i)=>lines.push((item.passed?'PASS':'FAIL')+' '+(i+1)+'. '+item.name,'  esperado: '+item.expected+' · recebido: '+item.actual,'  '+item.reason));
 bypassPersistAudit();bypassAppend(lines);status('bypassStatus',suite.passed===suite.total?'Todos os testes passaram.':'Há '+(suite.total-suite.passed)+' falha(s) na suíte.');
});
$('bypassExport').addEventListener('click',()=>{
 const data=bypassEngine.getAudit();if(!data.length)return status('bypassStatus','Ainda não há eventos para exportar.');
 const blob=new Blob([bypassEngine.exportAudit()],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='waynovo-bypass-audit.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 status('bypassStatus',data.length+' eventos exportados em JSON.');
});
$('bypassClear').addEventListener('click',()=>{bypassEngine.clearAudit();bypassPersistAudit();$('bypassLog').value='';status('bypassStatus','Auditoria da sessão limpa.');});
$('bypassResetContext').addEventListener('click',()=>{$('bypassExample').value='client-deny';bypassLoadExample();status('bypassStatus','Cenário padrão restaurado.');});
$('bypassSummary').textContent=bypassEngine.list().length+' adaptadores registrados · '+bypassEngine.list().map(x=>x.id).join(', ')+' · auditoria somente na sessão';
bypassLoadExample();
function questionPayload(){
 const stem=$('questionText').value.trim(),choices=$('questionChoices').value.trim(),evidence=$('questionEvidence').value.trim();
 if(!stem)return '';
 return 'MODO DE ESTUDO: analise a questão e ensine o raciocínio usando o material fornecido. Não interaja com a plataforma de origem, não submeta respostas e não afirme certeza se faltar contexto.\n\nENUNCIADO:\n'+stem+(choices?'\n\nALTERNATIVAS:\n'+choices:'')+(evidence?'\n\nMATERIAL DE APOIO EXTRAÍDO DA PÁGINA:\n'+evidence:'')+'\n\nFORMATO DA RESPOSTA:\n1. Identifique o conceito cobrado.\n2. Explique o raciocínio passo a passo.\n3. Compare as alternativas, se houver.\n4. Indique a resposta mais provável apenas quando houver base suficiente; justifique e atribua confiança alta, média ou baixa.\n5. Separe evidências do material, inferências e pontos não verificáveis.\n6. Dê uma dica para resolver questões semelhantes.';
}
$('prepareQuestion').addEventListener('click',()=>{
 const payload=questionPayload();if(!payload)return status('questionStatus','Cole o enunciado primeiro.');
 $('source').value=payload;$('source').dispatchEvent(new Event('input'));
 $('mode').value='practice';$('output').value='GUIA DE ANÁLISE\n\n'+payload;
 status('questionStatus','Questão organizada. Revise o guia ou solicite análise ao gateway de IA.');
});
$('clearQuestion').addEventListener('click',()=>{$('questionText').value='';$('questionChoices').value='';$('questionEvidence').value='';status('questionStatus','Campos limpos.');});
$('analyzeQuestionAI').addEventListener('click',()=>{
 const payload=questionPayload();if(!payload)return status('questionStatus','Cole o enunciado primeiro.');
 $('source').value=payload;$('source').dispatchEvent(new Event('input'));$('task').value='explain';
 status('questionStatus','Conteúdo preparado. A solicitação só será enviada após seu clique; confira o gateway e os custos.');
 activateTab('ai');$('askAI').click();
});

const COG_KEY='waynovo.cognitive.v1',COG_ACTIVE_KEY='waynovo.cognitive.active.v1';
let cogPlan=null,cogStepIndex=0,cogMemories=[];
function cogReadMemories(){
 try{
  const value=JSON.parse(localStorage.getItem(COG_KEY)||'[]');
  return Array.isArray(value)?value.filter(x=>x&&typeof x.goal==='string'&&Array.isArray(x.steps)).slice(0,30):[];
 }catch(_){return [];}
}
function cogSaveMemories(){
 try{localStorage.setItem(COG_KEY,JSON.stringify(cogMemories.slice(0,20)));return true;}
 catch(_){status('cogStatus','Não foi possível salvar: armazenamento indisponível ou cheio.');return false;}
}
function cogPersistActive(){
 try{
  if(!cogPlan){localStorage.removeItem(COG_ACTIVE_KEY);return true;}
  const snapshot={...cogPlan,context:String(cogPlan.context||'').slice(0,3500),lastResult:cogPlan.lastResult?{...cogPlan.lastResult,text:String(cogPlan.lastResult.text||'').slice(0,9000)}:null,lastAudit:String(cogPlan.lastAudit||'').slice(0,6000),completed:cogStepIndex};
  localStorage.setItem(COG_ACTIVE_KEY,JSON.stringify(snapshot));return true;
 }catch(_){status('cogStatus','Plano ativo não pôde ser salvo; copie uma versão de backup.');return false;}
}
function cogRestoreActive(){
 try{
  const item=JSON.parse(localStorage.getItem(COG_ACTIVE_KEY)||'null');
  if(!item||typeof item.goal!=='string'||!Array.isArray(item.steps)||!item.steps.length)return;
  cogPlan=item;cogStepIndex=Math.max(0,Math.min(Number(item.completed)||0,item.steps.length));
  $('cogGoal').value=item.goal;$('cogContext').value=String(item.context||'');
  $('cogStepResult').value=item.lastResult&&typeof item.lastResult.text==='string'?item.lastResult.text:'';
  $('cogAuditResult').value=String(item.lastAudit||'');
 }catch(_){}
}
cogMemories=cogReadMemories();
function cogCategory(goal){
 const g=goal.toLocaleLowerCase('pt-BR');
 if(/estud|aprender|revis|prova|mat[eé]ria|conceito|memor/.test(g))return 'aprendizagem';
 if(/red[aã]ç|escrev|texto|artigo|relat[oó]rio|apresenta/.test(g))return 'produção de conteúdo';
 if(/pesquis|investig|compara|analis|diagn[oó]st/.test(g))return 'pesquisa e análise';
 if(/automat|fluxo|organizar|processo|rotina|planilha/.test(g))return 'organização e automação';
 if(/program|c[oó]digo|site|aplicativo|script|bug|erro/.test(g))return 'desenvolvimento técnico';
 return 'objetivo geral';
}
function cogMakePlan(goal,context){
 const category=cogCategory(goal),hasContext=Boolean(context.trim()),steps=[];
 let rationale='O objetivo foi tratado como uma tarefa geral porque não há detalhes suficientes para classificá-lo com mais precisão. O plano prioriza esclarecer o resultado, reunir evidências, produzir uma entrega e conferir o resultado.';
 if(category==='aprendizagem')rationale='O objetivo envolve aprender ou revisar. Por isso, o plano começa identificando conhecimentos prévios, organiza o conteúdo em blocos e termina com recuperação ativa e verificação sem consulta.';
 else if(category==='produção de conteúdo')rationale='O objetivo envolve produzir um texto ou apresentação. O plano separa definição do público e critérios, estrutura, elaboração, revisão factual e edição final.';
 else if(category==='pesquisa e análise')rationale='O objetivo exige investigação. O plano separa pergunta, evidências, comparação de hipóteses, conclusão e limites para reduzir conclusões precipitadas.';
 else if(category==='organização e automação')rationale='O objetivo envolve um processo. O plano identifica entradas, saídas, permissões e exceções antes de testar um fluxo pequeno e verificar seus resultados.';
 else if(category==='desenvolvimento técnico')rationale='O objetivo envolve desenvolvimento técnico. O plano começa por requisitos reproduzíveis, isola a causa ou componente, propõe uma alteração pequena e exige testes antes de considerar concluído.';
 const add=(title,detail,why)=>steps.push({title,detail,why});
 add('Definir o resultado esperado','Reescreva o objetivo como uma entrega observável. Defina como saber que terminou e quais restrições não podem ser violadas.','Evita começar a executar sem um critério de sucesso claro.');
 if(category==='aprendizagem'){
  add('Mapear o que já sabe','Liste conhecimentos prévios, dúvidas e termos desconhecidos. Use o material de apoio, quando fornecido.','O ponto de partida ajuda a separar lacunas reais de conteúdo já dominado.');
  add('Estudar em blocos pequenos','Divida o material em 3 a 6 tópicos. Para cada tópico, escreva uma explicação curta e um exemplo próprio.','Blocos pequenos facilitam compreensão e revisão.');
  add('Praticar sem consultar','Responda perguntas próprias, explique o conceito em voz alta e compare a explicação com a fonte.','A recuperação ativa testa compreensão melhor do que apenas reler.');
  add('Verificar e programar revisão','Corrija imprecisões com a fonte e agende revisões espaçadas. Registre o que ainda ficou incerto.','A checagem separa lembrança de compreensão e deixa explícitas as lacunas.');
 }else if(category==='produção de conteúdo'){
  add('Definir público e requisitos','Identifique público, finalidade, formato, tamanho e tom. Transforme cada requisito em um critério verificável.','Uma entrega é adequada quando atende à finalidade e ao público.');
  add('Montar a estrutura','Crie título, seções e sequência lógica antes de escrever o texto completo.','A estrutura revela lacunas antes de investir na redação.');
  add('Produzir um primeiro rascunho','Escreva uma versão completa, marcando afirmações que precisam de fonte ou confirmação.','Separar rascunho de revisão ajuda a manter o fluxo.');
  add('Revisar conteúdo e linguagem','Confira fatos, fontes, coerência, clareza, ortografia e atendimento aos requisitos.','A revisão verifica precisão e legibilidade.');
 }else if(category==='pesquisa e análise'){
  add('Formular a pergunta de investigação','Defina escopo, período, termos principais e o que contaria como evidência suficiente.','Uma pergunta delimitada evita pesquisa dispersa.');
  add('Reunir evidências confiáveis','Registre fontes, datas, dados e limitações. Diferencie observações de suposições.','A conclusão depende da qualidade e atualidade das evidências.');
  add('Comparar hipóteses','Liste explicações alternativas, evidências favoráveis e contrárias e pontos ainda desconhecidos.','Comparar alternativas reduz o risco de confirmar apenas a primeira hipótese.');
  add('Concluir com nível de confiança','Responda à pergunta, justifique a conclusão e declare incertezas ou dados ausentes.','A conclusão deve ser proporcional às evidências reunidas.');
 }else if(category==='organização e automação'){
  add('Mapear entradas, saídas e permissões','Liste dados de entrada, resultado esperado, ações permitidas, limites e situações que exigem confirmação humana.','Definir limites evita ações inesperadas.');
  add('Desenhar o fluxo mínimo','Organize as etapas em sequência e acrescente condições para erros ou dados ausentes.','Um fluxo pequeno é mais fácil de testar e corrigir.');
  add('Testar em ambiente seguro','Use dados fictícios ou ambiente próprio. Registre cada etapa e valide os resultados.','O teste isolado reduz impactos acidentais.');
  add('Revisar exceções e documentar','Teste casos de erro, defina como desfazer mudanças e documente o comportamento esperado.','Um fluxo útil também precisa falhar de forma previsível.');
 }else if(category==='desenvolvimento técnico'){
  add('Registrar requisitos e reproduzir','Descreva comportamento esperado, comportamento atual, passos para reproduzir e ambiente.','Um problema reproduzível permite testar hipóteses.');
  add('Isolar a causa provável','Examine o menor componente envolvido e compare hipóteses com evidências.','Isolar reduz alterações desnecessárias.');
  add('Implementar uma mudança pequena','Faça uma alteração delimitada, mantenha cópia ou controle de versão e explique a intenção.','Mudanças pequenas facilitam revisão e reversão.');
  add('Executar testes e revisar','Verifique o caso original, casos de borda e regressões; documente limitações conhecidas.','A alteração só deve ser considerada válida depois de testada.');
 }else{
  add('Reunir contexto e recursos','Liste informações disponíveis, dependências, restrições e dúvidas que bloqueiam o avanço.','O contexto reduz suposições escondidas.');
  add('Dividir em etapas verificáveis','Quebre o objetivo em ações pequenas com uma saída observável para cada etapa.','Etapas verificáveis tornam o progresso mensurável.');
  add('Produzir a primeira entrega','Execute a menor parte útil do plano e registre as escolhas feitas.','Uma primeira entrega permite avaliar o caminho cedo.');
  add('Conferir o resultado','Compare a entrega com os critérios iniciais, procure erros e ajuste o que faltar.','A verificação fecha o ciclo e evita declarar sucesso prematuramente.');
 }
 add('Registrar conclusão e próximos passos','Resuma o que foi feito, o que foi verificado e o que permanece pendente.','Uma síntese clara preserva contexto para a próxima sessão.');
 return {id:String(Date.now())+'-'+Math.random().toString(36).slice(2,8),goal,context:context.slice(0,7000),category,rationale,steps,createdAt:new Date().toISOString(),completed:0};
}
function cogRender(){
 const list=$('cogSteps');list.replaceChildren();
 if(!cogPlan){
  list.textContent='Crie um plano para ver as etapas.';
  $('cogRationale').textContent='Seu diagnóstico aparecerá aqui.';
  $('cogEvidence').textContent='Nenhuma análise criada.';
  $('cogProgress').textContent='0 etapas';$('cogProgressBar').style.width='0%';
  $('cogNext').disabled=true;$('cogReset').disabled=true;$('cogSaveMemory').disabled=true;$('cogCopyPlan').disabled=true;
  $('cogRunStep').disabled=true;$('cogVerifyStep').disabled=true;$('cogSendResult').disabled=true;$('cogSaveResult').disabled=true;
  $('cogCurrentStep').textContent='Crie um plano para começar.';$('cogStepResult').value='';$('cogAuditResult').value='';
  return;
 }
 $('cogRationale').textContent=cogPlan.rationale;
 $('cogEvidence').textContent='Categoria: '+cogPlan.category+' · Contexto: '+(cogPlan.context?cogPlan.context.length+' caracteres fornecidos':'nenhum material adicional')+' · Plano local baseado no objetivo informado.';
 const total=cogPlan.steps.length,done=Math.min(cogStepIndex,total),pct=Math.round(done/total*100);
 $('cogProgress').textContent=done+' de '+total+' etapas · '+pct+'%';
 $('cogProgressBar').style.width=pct+'%';
 cogPlan.steps.forEach((step,i)=>{
  const card=document.createElement('div');card.className='cog-step'+(i<done?' done':i===done?' active':'');
  const head=document.createElement('div');head.className='cog-step-head';
  const num=document.createElement('span');num.className='cog-num';num.textContent=i<done?'✓':String(i+1);
  const name=document.createElement('span');name.textContent=step.title;
  const stateLabel=document.createElement('span');stateLabel.className='meta';stateLabel.style.marginLeft='auto';stateLabel.textContent=i<done?'Concluída':i===done?'Atual':'Pendente';
  head.append(num,name,stateLabel);
  const detail=document.createElement('p');detail.textContent=step.detail;
  const why=document.createElement('div');why.className='cog-why';why.textContent='Por que esta etapa: '+step.why;
  card.append(head,detail,why);list.append(card);
 });
 $('cogNext').disabled=done>=total;$('cogNext').textContent=done>=total?'Plano concluído':'Concluir etapa atual';
 $('cogReset').disabled=false;$('cogSaveMemory').disabled=false;$('cogCopyPlan').disabled=false;
 const activeStep=cogPlan.steps[Math.min(done,total-1)];
 $('cogCurrentStep').textContent=done>=total?'Todas as etapas estão marcadas. Revise as entregas salvas.':'Etapa '+(done+1)+' · '+activeStep.title+' — '+activeStep.detail;
 if(cogPlan.lastResult&&typeof cogPlan.lastResult.text==='string')$('cogStepResult').value=cogPlan.lastResult.text;
 $('cogAuditResult').value=String(cogPlan.lastAudit||'');
 $('cogRunStep').disabled=done>=total;$('cogVerifyStep').disabled=!String($('cogStepResult').value||'').trim();
 $('cogSendResult').disabled=!String($('cogStepResult').value||'').trim();$('cogSaveResult').disabled=!String($('cogStepResult').value||'').trim();
}
function cogPlanText(){
 if(!cogPlan)return '';
 return 'WAYNOVO COGNITIVE PLAN\nObjetivo: '+cogPlan.goal+'\nCategoria: '+cogPlan.category+'\nJustificativa: '+cogPlan.rationale+'\n\n'+cogPlan.steps.map((s,i)=>(i+1)+'. '+s.title+'\n'+s.detail+'\nPor que: '+s.why).join('\n\n')+'\n\nProgresso marcado: '+Math.min(cogStepIndex,cogPlan.steps.length)+'/'+cogPlan.steps.length;
}
$('cogPlan').addEventListener('click',()=>{
 const goal=$('cogGoal').value.trim(),context=$('cogContext').value.trim();
 if(!goal)return status('cogStatus','Descreva um objetivo antes de criar o plano.');
 cogPlan=cogMakePlan(goal,context);cogStepIndex=0;$('cogAIResult').value='';$('cogStepResult').value='';$('cogAuditResult').value='';
 cogPersistActive();cogRender();status('cogStatus','Plano criado localmente e salvo como plano ativo. Revise as etapas e marque cada uma quando realmente concluir.');
});
$('cogUseMaterial').addEventListener('click',()=>{
 const material=$('source').value.trim();
 if(!material)return status('cogStatus','Não há material na aba Estudo.');
 $('cogContext').value=material.slice(0,7000);status('cogStatus','Material copiado para o contexto do Cognitive Engine.');
});
$('cogNext').addEventListener('click',()=>{
 if(!cogPlan||cogStepIndex>=cogPlan.steps.length)return;
 cogStepIndex++;cogPersistActive();cogRender();
 status('cogStatus',cogStepIndex===cogPlan.steps.length?'Todas as etapas foram marcadas como concluídas. Confira os critérios e pendências antes de encerrar.':'Etapa marcada. A próxima etapa está destacada.');
});
$('cogReset').addEventListener('click',()=>{
 if(!cogPlan)return;cogStepIndex=0;cogPlan.lastResult=null;cogPlan.lastAudit='';$('cogStepResult').value='';$('cogAuditResult').value='';cogPersistActive();cogRender();status('cogStatus','Progresso do plano reiniciado; objetivo e etapas foram mantidos.');
});
$('cogSaveMemory').addEventListener('click',()=>{
 if(!cogPlan)return;
 if(String($('cogStepResult').value||'').trim())cogPlan.lastResult={...(cogPlan.lastResult||{}),stepIndex:cogStepIndex,text:String($('cogStepResult').value).slice(0,9000)};
 cogPlan.lastAudit=String($('cogAuditResult').value||cogPlan.lastAudit||'').slice(0,6000);cogPersistActive();
 const item={...cogPlan,completed:cogStepIndex};
 cogMemories=[item,...cogMemories.filter(x=>x.id!==item.id)].slice(0,20);
 if(cogSaveMemories()){cogRenderMemories();status('cogStatus','Plano salvo na memória local deste navegador.');}
});
$('cogCopyPlan').addEventListener('click',async()=>{
 if(!cogPlan)return;status('cogStatus',await copy(cogPlanText())?'Plano e última entrega copiados.':'Não foi possível copiar neste navegador.');
});

async function cogGatewayRequest(task,content){
 const endpoint=$('endpoint').value.trim(),token=$('token').value.trim();
 if(!endpoint||!token)throw new Error('Configure endpoint e token na aba IA primeiro.');
 let url;try{url=new URL(endpoint);}catch(_){throw new Error('Endpoint inválido.');}
 if(url.protocol!=='https:'&&url.hostname!=='localhost'&&url.hostname!=='127.0.0.1')throw new Error('Use HTTPS, exceto em localhost.');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),55000);
 try{
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({task,content:content.slice(0,28000),pageTitle:title,provider:$('provider').value,fallback:$('fallback').value!=='false'}),signal:controller.signal});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||'Gateway HTTP '+response.status);
  if(typeof data.text!=='string'||!data.text.trim())throw new Error('A IA retornou resposta vazia.');
  return data;
 }catch(error){if(error.name==='AbortError')throw new Error('Tempo limite excedido.');throw error;}
 finally{clearTimeout(timeout);}
}
$('cogStepResult').addEventListener('input',()=>{
 const has=Boolean(String($('cogStepResult').value||'').trim());
 $('cogVerifyStep').disabled=!has;$('cogSendResult').disabled=!has;$('cogSaveResult').disabled=!has;
});
$('cogStepResult').addEventListener('change',()=>{
 if(cogPlan){cogPlan.lastResult={...(cogPlan.lastResult||{}),stepIndex:cogStepIndex,text:String($('cogStepResult').value).slice(0,9000)};cogPersistActive();}
});
$('cogRunStep').addEventListener('click',async()=>{
 if(!cogPlan)return status('cogActionStatus','Crie ou recupere um plano primeiro.');
 if(cogStepIndex>=cogPlan.steps.length)return status('cogActionStatus','Todas as etapas já estão marcadas como concluídas.');
 const step=cogPlan.steps[cogStepIndex],btn=$('cogRunStep'),old=btn.textContent;
 const content='OBJETIVO:\n'+cogPlan.goal+'\n\nETAPA ATUAL ('+(cogStepIndex+1)+'/'+cogPlan.steps.length+'):\n'+step.title+'\n'+step.detail+'\n\nJUSTIFICATIVA:\n'+step.why+'\n\nCONTEXTO:\n'+(cogPlan.context||'(não fornecido)')+'\n\nPRODUZA uma entrega útil para esta etapa. Separe fatos do contexto, inferências e pontos que precisam de confirmação. Não diga que executou ações externas nem invente evidências. Termine com critérios objetivos de revisão.';
 btn.disabled=true;btn.textContent='Executando…';status('cogActionStatus','Enviando somente a etapa atual ao provedor escolhido…');
 try{
  const data=await cogGatewayRequest('explain',content);
  $('cogStepResult').value=data.text.trim();$('cogAuditResult').value='';
  cogPlan.lastResult={stepIndex:cogStepIndex,text:data.text.trim(),provider:data.provider||'',model:data.model||'',createdAt:new Date().toISOString()};
  cogPlan.lastAudit='';cogPersistActive();cogRender();
  status('cogActionStatus','Entrega recebida · '+(data.provider||'gateway')+' / '+(data.model||'modelo')+(data.fallbackUsed?' · fallback usado':'')+'. Revise antes de marcar a etapa.');
 }catch(error){status('cogActionStatus',error.message||'Falha na execução assistida.');}
 finally{btn.disabled=false;btn.textContent=old;}
});
$('cogVerifyStep').addEventListener('click',async()=>{
 if(!cogPlan)return status('cogActionStatus','Crie ou recupere um plano primeiro.');
 const result=String($('cogStepResult').value||'').trim();if(!result)return status('cogActionStatus','Gere ou cole um resultado antes de auditar.');
 const idx=cogPlan.lastResult&&Number.isInteger(cogPlan.lastResult.stepIndex)?cogPlan.lastResult.stepIndex:cogStepIndex;
 const step=cogPlan.steps[Math.max(0,Math.min(idx,cogPlan.steps.length-1))];
 const content='OBJETIVO:\n'+cogPlan.goal+'\n\nETAPA:\n'+step.title+'\n'+step.detail+'\n\nCONTEXTO/FONTE:\n'+(cogPlan.context||'(não fornecido)')+'\n\nRESULTADO:\n'+result+'\n\nAUDITE aderência ao objetivo, critérios atendidos, lacunas, afirmações sem suporte, contradições, riscos e próximos passos. Separe fatos, inferências e pontos não verificáveis. Não invente evidências nem declare testes não realizados. Termine com veredito calibrado: adequado, parcialmente adequado ou precisa de revisão.';
 const btn=$('cogVerifyStep'),old=btn.textContent;btn.disabled=true;btn.textContent='Auditando…';status('cogActionStatus','Solicitando revisão crítica…');
 try{
  const data=await cogGatewayRequest('verify',content);
  $('cogAuditResult').value=data.text.trim();cogPlan.lastAudit=data.text.trim();cogPersistActive();
  status('cogActionStatus','Auditoria recebida · '+(data.provider||'gateway')+' / '+(data.model||'modelo')+(data.fallbackUsed?' · fallback usado':'')+'. Segunda opinião: confira as fontes.');
 }catch(error){status('cogActionStatus',error.message||'Falha na auditoria.');}
 finally{btn.disabled=false;btn.textContent=old;}
});
$('cogSendResult').addEventListener('click',()=>{
 const result=String($('cogStepResult').value||'').trim();if(!result)return status('cogActionStatus','Não há resultado para enviar.');
 $('source').value='Resultado Waynovo · '+(cogPlan?cogPlan.goal:'')+'\n\n'+result;
 $('source').dispatchEvent(new Event('input'));$('output').value=result;
 status('studyStatus','Resultado do Cognitive Engine enviado para a aba Estudo.');
 activateTab('study');$('output').focus();
});
$('cogSaveResult').addEventListener('click',()=>{
 if(!cogPlan)return;
 cogPlan.lastResult={...(cogPlan.lastResult||{}),stepIndex:cogStepIndex,text:String($('cogStepResult').value||'').slice(0,9000)};
 cogPlan.lastAudit=String($('cogAuditResult').value||cogPlan.lastAudit||'').slice(0,6000);
 const item={...cogPlan,completed:cogStepIndex};cogMemories=[item,...cogMemories.filter(x=>x.id!==item.id)].slice(0,20);
 cogPersistActive();
 if(cogSaveMemories()){cogRenderMemories();status('cogActionStatus','Plano, entrega e auditoria guardados na memória local.');}
});

$('cogAskAI').addEventListener('click',async()=>{
 const goal=$('cogGoal').value.trim(),context=$('cogContext').value.trim();
 if(!goal)return status('cogStatus','Descreva um objetivo antes de solicitar análise.');
 const btn=$('cogAskAI'),old=btn.textContent;
 const content='OBJETIVO DO USUÁRIO:\n'+goal+'\n\nCONTEXTO FORNECIDO:\n'+(context||'(não fornecido)')+'\n\nCrie um plano acionável em etapas, declare pressupostos, separe fatos de inferências e inclua critérios de verificação, riscos e próximos passos. Explique resumidamente por que cada etapa existe. Não afirme que executou ações; forneça justificativas verificáveis.';
 btn.disabled=true;btn.textContent='Analisando…';
 try{
  const data=await cogGatewayRequest('plan',content);
  $('cogAIResult').value=data.text.trim();
  status('cogStatus','Análise recebida · '+(data.provider||'provedor')+' / '+(data.model||'modelo')+(data.fallbackUsed?' · fallback usado':'')+'. Compare com as sugestões locais.');
 }catch(error){status('cogStatus',error.message||'Falha ao acessar o gateway.');}
 finally{btn.disabled=false;btn.textContent=old;}
});
$('cogClearMemory').addEventListener('click',()=>{
 if(!cogMemories.length)return status('cogStatus','A memória já está vazia.');
 if(!confirm('Apagar todos os planos salvos na memória local deste navegador?'))return;
 cogMemories=[];cogSaveMemories();cogRenderMemories();status('cogStatus','Memória local apagada.');
});
function cogRenderMemories(){
 const list=$('cogMemories');list.replaceChildren();
 if(!cogMemories.length){const empty=document.createElement('div');empty.className='meta';empty.textContent='Nenhuma memória salva.';list.append(empty);return;}
 cogMemories.slice(0,8).forEach(item=>{
  const row=document.createElement('div');row.className='cog-memory';
  const label=document.createElement('span');
  const date=new Date(item.createdAt||Date.now());
  label.textContent=item.goal+' · '+(Number(item.completed)||0)+'/'+item.steps.length+' etapas · '+date.toLocaleDateString('pt-BR');
  const open=document.createElement('button');open.className='btn';open.textContent='Reabrir';
  open.addEventListener('click',()=>{
   cogPlan={...item};cogStepIndex=Math.min(Number(item.completed)||0,cogPlan.steps.length);
   $('cogGoal').value=item.goal;$('cogContext').value=item.context||'';$('cogAIResult').value='';
   cogRender();status('cogStatus','Memória recuperada. Continue o plano ou reinicie o progresso.');
  });
  row.append(label,open);list.append(row);
 });
}
cogRestoreActive();cogRenderMemories();cogRender();

// Autopilot: monitor automático somente do conteúdo renderizado e visível.
const AUTO_SESSION_KEY='waynovo.autopilot.session.v1';
const autoStats=(()=>{
 try{
  const raw=JSON.parse(sessionStorage.getItem(AUTO_SESSION_KEY)||'{}');
  return {
   seconds:Number.isFinite(Number(raw.seconds))?Math.max(0,Number(raw.seconds)):0,
   scans:Number.isFinite(Number(raw.scans))?Math.max(0,Number(raw.scans)):0,
   drafts:Number.isFinite(Number(raw.drafts))?Math.max(0,Number(raw.drafts)):0,
   seen:Array.isArray(raw.seen)?raw.seen.filter(x=>typeof x==='string').slice(-500):[]
  };
 }catch(_){return {seconds:0,scans:0,drafts:0,seen:[]};}
})();
const autoSeen=new Set(autoStats.seen);
let autoDrafts=[];
let autoRunning=true;
let autoObserver=null,autoScannerInterval=null,autoClockInterval=null,autoDebounce=null;
let autoLastTick=Date.now();
function autoPersist(){
 try{sessionStorage.setItem(AUTO_SESSION_KEY,JSON.stringify({...autoStats,seen:[...autoSeen].slice(-500)}));}catch(_){}
}
function autoClock(value){
 const seconds=Math.max(0,Math.floor(value));
 const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60;
 return h?String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function autoHash(value){
 let hash=2166136261;
 for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return (hash>>>0).toString(36);
}
function autoVisibleBlocks(){
 const selector='[role="question"],[data-testid*="question" i],[class*="question" i],[role="radio"],[role="option"],[class*="option" i],[class*="answer" i],label,p,li,article,h1,h2,h3,h4,div,button[role="radio"],button[role="option"],button[class*="option" i],button[class*="answer" i]';
 const nodes=Array.from(document.querySelectorAll(selector)).slice(0,3500);
 const seenText=new Set(),blocks=[];
 for(const el of nodes){
  if(host.contains(el))continue;
  const tag=String(el.tagName||'').toUpperCase();
  const marker=String(el.className||'')+' '+String(el.getAttribute('data-testid')||'');
  const role=el.getAttribute('role')||'';
  const isChoice=role==='radio'||role==='option'||/option|answer/i.test(marker);
  if(['SCRIPT','STYLE','NOSCRIPT','SVG','INPUT','TEXTAREA','SELECT','OPTION','NAV','HEADER','FOOTER'].includes(tag))continue;
  if(tag==='BUTTON'&&!isChoice)continue;
  if(!el.getClientRects||!el.getClientRects().length)continue;
  if(el.closest&&el.closest('[aria-hidden="true"],[hidden],[inert]'))continue;
  let style;try{style=getComputedStyle(el);}catch(_){continue;}
  if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0)continue;
  const isMarked=/question/i.test(marker)||role==='question';
  if(tag==='DIV'&&!isMarked&&el.querySelector('p,li,article,[role="question"],[class*="question" i],[data-testid*="question" i]'))continue;
  const text=String(el.innerText||el.textContent||el.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim();
  if(text.length<18||text.length>1600)continue;
  const key=text.toLocaleLowerCase('pt-BR');
  if(seenText.has(key))continue;
  seenText.add(key);blocks.push(text);
  if(blocks.length>=500)break;
 }
 return blocks;
}
const autoStop=new Set('a ao aos as com como da das de do dos e ela ele elas eles em entre era essa esse esta este eu foi foram há isso isto já lhe lhes mais mas me mesmo na nas não nem no nos nós o os ou para pela pelo pelas pelos por porque qual quais quando quanto quantos que quem se sem ser seu sua suas também tem ter teu tua um uma umas uns você vocês'.split(' '));
function autoTokens(text){
 const normalized=String(text||'').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 return [...new Set((normalized.match(/[a-z0-9]{3,}/g)||[]).filter(x=>!autoStop.has(x)))].slice(0,60);
}
function autoIsQuestion(text){
 return /[?¿？]/.test(text)||/^(?:qual|quais|quem|quando|onde|por que|porque|como|quanto|quantos|explique|descreva|calcule|determine|identifique|assinale|selecione|marque|compare|cite|defina|resolva)\b/i.test(text);
}
function autoCollectOptions(question,blocks){
 const inline=String(question||'').replace(/\s+/g,' ').trim();
 const marker=/(?:^|\s)([A-E])[\)\].:\-]\s*/gi;
 const points=[];let match;
 while((match=marker.exec(inline))!==null){
  points.push({label:match[1].toUpperCase(),start:match.index+(match[0].startsWith(' ')?1:0),end:marker.lastIndex});
 }
 const options=[];
 if(points.length>=2){
  for(let i=0;i<points.length;i++){
   const end=i+1<points.length?points[i+1].start:inline.length;
   const text=inline.slice(points[i].end,end).trim();
   if(text)options.push(points[i].label+') '+text);
  }
 }
 if(options.length>=2)return options.slice(0,8);
 const start=blocks.indexOf(question);
 if(start<0)return options;
 for(let i=start+1;i<Math.min(blocks.length,start+11);i++){
  const value=String(blocks[i]||'').trim();
  if(autoIsQuestion(value))break;
  const item=value.match(/^\s*(?:\(([A-E])\)|([A-E])[\).:\-])\s*(.+)$/i);
  if(item){
   const label=(item[1]||item[2]).toUpperCase();
   if(!options.some(x=>x.startsWith(label+')')))options.push(label+') '+item[3].trim());
   if(options.length>=8)break;
  }
 }
 return options.slice(0,8);
}
function autoFindEvidence(question,blocks){
 const terms=autoTokens(question);
 if(!terms.length)return [];
 const matches=[];
 for(const block of blocks){
  if(block===question||block.length<35||/^\s*(?:\([A-E]\)|[A-E][).:\-])\s+/i.test(block))continue;
  const blockTerms=new Set(autoTokens(block));
  const hits=terms.filter(term=>blockTerms.has(term));
  const score=hits.length/Math.max(3,Math.min(terms.length,12));
  if(score>=0.16)matches.push({text:block,score,hits});
 }
 matches.sort((a,b)=>b.score-a.score||b.hits.length-a.hits.length);
 return matches.slice(0,2);
}
function autoMakeDraft(question,evidence){
 if(!evidence.length)return 'Ainda não encontrei evidência suficiente no texto visível desta página. O enunciado foi detectado, mas precisa de contexto ou pesquisa adicional.';
 return 'Rascunho sugerido com base no conteúdo encontrado na página:\n'+evidence.map((item,i)=>(i+1)+'. '+item.text).join('\n')+'\n\nConfira se esses trechos realmente respondem ao enunciado antes de usar.';
}
function autoRender(){
 $('autoTime').textContent=autoClock(autoStats.seconds);
 $('autoScans').textContent=String(autoStats.scans);
 $('autoQuestions').textContent=String(autoSeen.size);
 $('autoDrafts').textContent=String(autoStats.drafts);
 $('autoState').textContent=autoRunning?'ROBÔ ATIVO · observando conteúdo visível':'ROBÔ PAUSADO · clique em Retomar para continuar';
 $('autoToggle').textContent=autoRunning?'Pausar robô':'Retomar robô';
 const list=$('autoResults');list.replaceChildren();
 if(!autoDrafts.length){
  const empty=document.createElement('div');empty.className='meta';
  empty.textContent=autoSeen.size?'As questões já encontradas nesta sessão não têm rascunho recente nesta abertura. Faça uma nova varredura.':'Nenhuma questão visível detectada ainda. Mantenha esta aba aberta ou toque em Varredura agora.';
  list.append(empty);return;
 }
 autoDrafts.slice(0,25).forEach((item,index)=>{
  const card=document.createElement('article');card.className='auto-item';
  const heading=document.createElement('div');heading.className='auto-question';heading.textContent=(index+1)+'. '+item.question;
  const choices=document.createElement('div');choices.className='auto-evidence';choices.textContent=item.options&&item.options.length?'Alternativas detectadas:\n'+item.options.join('\n'):'Nenhuma alternativa reconhecida automaticamente.';
  const answer=document.createElement('div');answer.className='auto-answer';answer.textContent=item.draft;
  const evidence=document.createElement('div');evidence.className='auto-evidence';
  evidence.textContent=item.evidence.length?'Evidência · correspondência textual: '+Math.round(item.evidence[0].score*100)+'%':'Evidência · nenhum trecho relacionado encontrado';
  const actions=document.createElement('div');actions.className='row';
  const tutor=document.createElement('button');tutor.className='btn primary';tutor.textContent='Levar ao Tutor';
  tutor.addEventListener('click',()=>{
   $('questionText').value=item.question;
   $('questionChoices').value=(item.options||[]).join('\n');
   $('questionEvidence').value=(item.evidence||[]).map(x=>x.text).join('\n\n');
   $('source').value='ENUNCIADO:\n'+item.question+'\n\nALTERNATIVAS:\n'+((item.options||[]).join('\n')||'(não detectadas)')+'\n\nTRECHOS DE APOIO:\n'+(item.evidence||[]).map(x=>x.text).join('\n');
   $('source').dispatchEvent(new Event('input'));
   status('questionStatus','Questão e alternativas extraídas pelo Autopilot. Revise e solicite a explicação do Tutor.');
   activateTab('questions');
  });
  const open=document.createElement('button');open.className='btn';open.textContent='Abrir no Estudo';
  open.addEventListener('click',()=>{
   $('source').value='ENUNCIADO:\n'+item.question+'\n\nRASCUNHO:\n'+item.draft;
   $('source').dispatchEvent(new Event('input'));
   $('output').value=item.draft;
   status('studyStatus','Rascunho do Autopilot enviado para revisão. Confira a fonte.');
   activateTab('study');
  });
  actions.append(tutor,open);card.append(heading,choices,answer,evidence,actions);list.append(card);
 });
}
function autoScan(force){
 if(!autoRunning&&!force)return;
 const blocks=autoVisibleBlocks();
 autoStats.scans++;
 let added=0;
 blocks.filter(autoIsQuestion).forEach(question=>{
  const key=autoHash(question.toLocaleLowerCase('pt-BR').replace(/\s+/g,' ').trim());
  const isNew=!autoSeen.has(key);
  if(isNew){autoSeen.add(key);autoStats.drafts++;}
  const options=autoCollectOptions(question,blocks);
  const evidence=autoFindEvidence(question,blocks);
  const previous=autoDrafts.find(item=>item.id===key);
  if(!previous){
   added++;
   autoDrafts.unshift({id:key,question,options,evidence,draft:autoMakeDraft(question,evidence)});
  }else{
   if(options.length)previous.options=options;
   if(evidence.length)previous.evidence=evidence;
   previous.draft=autoMakeDraft(question,previous.evidence||[]);
  }
 });
 autoDrafts=autoDrafts.slice(0,25);
 autoPersist();autoRender();
 status('autoStatus',added
  ?added+' nova(s) questão(ões) detectada(s); rascunhos locais preparados.'
  :'Varredura concluída · '+blocks.length+' bloco(s) de texto visível(is) analisado(s), sem novas questões.');
}
function autoScheduleScan(){
 if(!autoRunning||autoDebounce)return;
 autoDebounce=setTimeout(()=>{autoDebounce=null;autoScan(false);},1200);
}
function autoStart(){
 autoRunning=true;
 if(autoObserver)autoObserver.disconnect();
 if(typeof MutationObserver==='function'&&document.body){
  autoObserver=new MutationObserver(records=>{
   if(records.every(record=>host.contains(record.target)))return;
   autoScheduleScan();
  });
  autoObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
 }
 if(autoScannerInterval)clearInterval(autoScannerInterval);
 autoScannerInterval=setInterval(()=>autoScan(false),6000);
 autoRender();autoScan(true);
}
function autoPause(){
 autoRunning=false;
 if(autoObserver){autoObserver.disconnect();autoObserver=null;}
 if(autoScannerInterval){clearInterval(autoScannerInterval);autoScannerInterval=null;}
 if(autoDebounce){clearTimeout(autoDebounce);autoDebounce=null;}
 autoRender();status('autoStatus','Monitor pausado. O cronômetro continua contando enquanto o Waynovo estiver aberto.');
}
$('autoScanNow').addEventListener('click',()=>autoScan(true));
$('autoToggle').addEventListener('click',()=>{if(autoRunning)autoPause();else autoStart();});
$('autoCopy').addEventListener('click',async()=>{
 if(!autoDrafts.length)return status('autoStatus','Ainda não há rascunhos para copiar.');
 const text=autoDrafts.map((item,i)=>(i+1)+'. '+item.question+'\n'+((item.options||[]).join('\n'))+'\n'+item.draft).join('\n\n---\n\n');
 status('autoStatus',await copy(text)?'Rascunhos copiados.':'Não foi possível copiar neste navegador.');
});
autoClockInterval=setInterval(()=>{
 const now=Date.now();
 if(!document.hidden)autoStats.seconds+=Math.max(0,Math.min(3,Math.round((now-autoLastTick)/1000)));
 autoLastTick=now;autoRender();
 if(autoStats.seconds%5===0)autoPersist();
},1000);
document.addEventListener('visibilitychange',()=>{autoLastTick=Date.now();});
autoStart();

root.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));root.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===b.dataset.tab));if(touchLayout())b.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});}));
$('theme').addEventListener('click',()=>{host.dataset.theme=host.dataset.theme==='light'?'dark':'light';});
$('min').addEventListener('click',()=>{$('panel').classList.toggle('minimized');$('min').textContent=$('panel').classList.contains('minimized')?'+':'−';});
function close(){if(interval)clearInterval(interval);if(autoScannerInterval)clearInterval(autoScannerInterval);if(autoClockInterval)clearInterval(autoClockInterval);if(autoObserver)autoObserver.disconnect();if(autoDebounce)clearTimeout(autoDebounce);autoPersist();host.remove();}
host.__waynovoCleanup=close;
$('close').addEventListener('click',close);root.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
let drag=null;const touchLayout=()=>window.matchMedia&&window.matchMedia('(pointer: coarse), (max-width: 640px)').matches;$('drag').addEventListener('pointerdown',e=>{if(touchLayout()||e.target.closest('button'))return;const r=host.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};$('drag').setPointerCapture(e.pointerId);});
$('drag').addEventListener('pointermove',e=>{if(!drag)return;host.style.left=Math.max(0,Math.min(innerWidth-host.offsetWidth,e.clientX-drag.x))+'px';host.style.top=Math.max(0,Math.min(innerHeight-48,e.clientY-drag.y))+'px';host.style.right='auto';host.style.bottom='auto';});
const stop=()=>{drag=null;};$('drag').addEventListener('pointerup',stop);$('drag').addEventListener('pointercancel',stop);
if(!window.matchMedia||!window.matchMedia('(pointer: coarse), (max-width: 640px)').matches)$('source').focus();
})();