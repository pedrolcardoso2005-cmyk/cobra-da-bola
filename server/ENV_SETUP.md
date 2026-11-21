# Configuracao de ambiente do servidor

Crie um arquivo `.env` dentro de `server/` (ele e ignorado pelo git) com as
variaveis abaixo.

```
# Obrigatorio em producao: segredo usado para assinar os tokens de login.
JWT_SECRET=troque-isto-por-um-segredo-longo-e-aleatorio

# Porta do servidor HTTP/WebSocket.
PORT=8787

# Origem do front-end (para CORS).
WEB_ORIGIN=http://localhost:5173

# Caminho do arquivo SQLite (opcional; padrao: server/data/cobra.db).
# DB_PATH=./data/cobra.db

# Origem do front-end usada para montar o link de redefinicao de senha.
# FRONTEND_URL=http://localhost:5173

# --- Envio de e-mail (recuperacao de senha) -- opcional ---
# Se SMTP_HOST/PORT/USER/PASS nao estiverem definidos, o link de
# redefinicao e apenas registrado no log do servidor (fluxo segue
# testavel de ponta a ponta sem provedor configurado).
# SMTP_HOST=smtp.seu-provedor.com
# SMTP_PORT=587
# SMTP_USER=usuario
# SMTP_PASS=senha-ou-api-key
# SMTP_FROM="Cobra da Bola <no-reply@seudominio.com>"

# --- Geracao automatica de perguntas via IA (server/src/questions/ai/) -- opcional ---
# Desligado por padrao: so ligar APOS revisar um lote pequeno manualmente.
# AI_QUESTIONS_ENABLED=false

# Chave da API da Anthropic (geracao das perguntas). Nunca definir um
# equivalente com prefixo VITE_ -- essa chave nao pode chegar ao navegador.
# ANTHROPIC_API_KEY=
# AI_QUESTIONS_MODEL=claude-sonnet-5-5

# Chave da API da OpenAI, usada só para embeddings (checagem de duplicata
# semantica). Opcional: sem ela, a deduplicacao usa so similaridade de texto.
# OPENAI_API_KEY=
# AI_QUESTIONS_EMBEDDING_MODEL=text-embedding-3-small

# Estoque minimo/alvo GLOBAL (usado para qualquer dificuldade sem um
# override especifico abaixo), tamanho do lote de geracao, teto de lotes
# por dia (protege contra custo por bug de config) e se perguntas aprovadas
# automaticamente entram direto no jogo (mantenha "false" ate confiar no
# pipeline -- por padrao toda pergunta gerada fica pendente de revisao em
# /api/perguntas/ia/pendentes).
# AI_QUESTIONS_MIN_STOCK=15
# AI_QUESTIONS_TARGET_STOCK=40
# AI_QUESTIONS_BATCH_SIZE=20
# AI_QUESTIONS_MAX_BATCHES_PER_DAY=6
# AI_QUESTIONS_MAX_BUCKETS_PER_RUN=4
# AI_QUESTIONS_AUTO_APPROVE=false

# Overrides por dificuldade (sobrescrevem os dois globais acima so para
# essa dificuldade). Os defaults do codigo ja refletem a meta de referencia
# combinada (~3000 perguntas: 750 cada para facil/moderado/medio, 750
# divididas entre dificil/impossivel, sobre 14 categorias) -- so defina
# estas se quiser ajustar essa distribuicao.
# AI_QUESTIONS_MIN_STOCK_FACIL=20
# AI_QUESTIONS_MIN_STOCK_MODERADO=20
# AI_QUESTIONS_MIN_STOCK_MEDIO=20
# AI_QUESTIONS_MIN_STOCK_DIFICIL=10
# AI_QUESTIONS_MIN_STOCK_IMPOSSIVEL=10
# AI_QUESTIONS_TARGET_STOCK_FACIL=54
# AI_QUESTIONS_TARGET_STOCK_MODERADO=54
# AI_QUESTIONS_TARGET_STOCK_MEDIO=54
# AI_QUESTIONS_TARGET_STOCK_DIFICIL=27
# AI_QUESTIONS_TARGET_STOCK_IMPOSSIVEL=27

# Circuit breaker: um bucket com N tentativas consecutivas com erro para de
# ser retentado automaticamente (fica visivel em /estoque e no log como
# "circuit breaker aberto") ate alguem investigar. 0 desativa.
# AI_QUESTIONS_CIRCUIT_BREAKER_THRESHOLD=3

# Prioridade por demanda real: alem do deficit estatico, o watcher pondera
# quantas perguntas de cada bucket foram servidas a partidas nas ultimas
# AI_QUESTIONS_DEMAND_WINDOW_HOURS horas (question_consumption_log),
# multiplicado por AI_QUESTIONS_DEMAND_WEIGHT. 0 desativa (volta a ordenar
# so por deficit, o comportamento anterior a essa funcionalidade).
# AI_QUESTIONS_DEMAND_WINDOW_HOURS=24
# AI_QUESTIONS_DEMAND_WEIGHT=2

# Limiares de similaridade (0-1) para a deduplicacao semantica por embedding.
# AI_QUESTIONS_DUP_REJECT_THRESHOLD=0.95
# AI_QUESTIONS_DUP_REVIEW_THRESHOLD=0.85

# --- Painel/rotas administrativas (/api/perguntas/ia/*) ---
# Lista de e-mails (separados por virgula) com acesso as rotas de revisao,
# aprovacao e geracao manual. Sem isso, NINGUEM alem de quem ja tiver
# users.is_admin=1 no banco consegue usar essas rotas -- inclusive voce.
# Cheque o valor a cada requisicao (nao precisa reiniciar o servidor depois
# de mudar essa variavel no Railway e fazer o proximo deploy).
# ADMIN_EMAILS=seu-email@exemplo.com
```

## Envio de e-mail (recuperacao de senha)

`server/src/auth/mailer.ts` ja implementa o envio via SMTP (usando
`nodemailer`): quando as variaveis `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` e
`SMTP_PASS` estao definidas no `.env`, o e-mail de redefinicao e enviado de
verdade pelo provedor configurado (qualquer um que exponha SMTP -- SES,
Mailgun, SendGrid, Gmail/Workspace com senha de app, etc). Sem essas
variaveis, o link continua apenas no log do servidor, para que o fluxo
nunca fique quebrado em desenvolvimento.

## Deploy no Railway (producao)

O build da raiz (`npm run build`) compila `shared`, `server` e `web`; em
producao o proprio servidor Express passa a servir os arquivos estaticos de
`web/dist` (ver `server/src/index.ts`), entao e um unico servico Railway,
sem CORS entre dois dominios. `railway.json` na raiz do projeto ja define o
build (`npm install && npm run build`) e o start (`npm start`).

Variaveis que **precisarao** ser configuradas no painel do Railway (nenhuma
delas esta no repositorio nem sera alterada por mim):

```
JWT_SECRET=   # obrigatorio em producao -- o servidor recusa subir sem isso
DB_PATH=/data/cobra.db   # caminho dentro de um Volume do Railway (ver abaixo)
WEB_ORIGIN=https://<dominio-ou-subdominio-que-o-railway-te-der>
FRONTEND_URL=https://<mesmo-dominio-acima>
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=   # a mesma API key do Resend que voce ja usa localmente
SMTP_FROM="Cobra da Bola <onboarding@resend.dev>"
```

`PORT` e definido automaticamente pelo Railway (o servidor ja le
`process.env.PORT`) -- nao precisa configurar.

As variaveis `AI_QUESTIONS_*`/`ANTHROPIC_API_KEY`/`OPENAI_API_KEY` acima sao
opcionais e **nao devem ser configuradas no Railway** ate que o pipeline de
geracao de perguntas por IA tenha sido revisado e aprovado -- sem
`AI_QUESTIONS_ENABLED=true`, o codigo nao faz nenhuma chamada externa.

**Persistencia do SQLite**: o SQLite e um arquivo (`cobra.db`), e o sistema
de arquivos do Railway nao e persistente entre deploys por padrao. E
necessario criar um **Volume** no servico (Railway -> aba "Volumes" ->
montar em `/data`) e apontar `DB_PATH=/data/cobra.db` para dentro dele.

**Como confirmar que isso esta de fato configurado** (uma auditoria real
encontrou indicios de que perguntas aprovadas desapareceram entre dois
deploys -- os passos abaixo sao como verificar, nao como assumir):
1. Railway -> o servico -> aba **Volumes** -> confirme que existe um
   volume e que o **Mount Path** dele e exatamente o mesmo caminho usado
   em `DB_PATH` (ex.: ambos `/data`).
2. Railway -> aba **Variables** -> confirme que `DB_PATH` esta definido e
   aponta para dentro desse mount path (ex.: `/data/cobra.db`), nao para o
   caminho padrao do codigo (que fica dentro do container, nao do volume).
3. Depois de um deploy, procure no log a linha
   `[persistencia] DB_PATH=... perguntas_geradas_por_ia_no_banco=N`
   (log automatico a cada boot, ver `server/src/index.ts`). Se esse N
   voltar a 0 (ou cair) depois de um deploy que deveria ter preservado
   perguntas geradas por IA, a persistencia nao esta configurada
   corretamente -- e nao basta o `DB_PATH` apontar para algum caminho, ele
   precisa apontar para *dentro* do volume montado.
4. Alternativa, se o volume realmente nao estiver disponivel no plano
   atual do Railway: o SQLite em si continua adequado para o volume de
   dados deste projeto (a meta de ~3000 perguntas e pequena); o problema
   seria exclusivamente de onde o arquivo mora, nao do motor de banco.
   PostgreSQL so passaria a ser necessario se o projeto rodasse mais de
   uma instancia do servidor ao mesmo tempo (hoje e um unico servico).
