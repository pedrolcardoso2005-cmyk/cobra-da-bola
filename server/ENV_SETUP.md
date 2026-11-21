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

# Estoque minimo/alvo por categoria x dificuldade, tamanho do lote de
# geracao, teto de lotes por dia (protege contra custo por bug de config) e
# se perguntas aprovadas automaticamente entram direto no jogo (mantenha
# "false" ate confiar no pipeline -- por padrao toda pergunta gerada fica
# pendente de revisao em /api/perguntas/ia/pendentes).
# AI_QUESTIONS_MIN_STOCK=15
# AI_QUESTIONS_TARGET_STOCK=40
# AI_QUESTIONS_BATCH_SIZE=20
# AI_QUESTIONS_MAX_BATCHES_PER_DAY=6
# AI_QUESTIONS_AUTO_APPROVE=false

# Limiares de similaridade (0-1) para a deduplicacao semantica por embedding.
# AI_QUESTIONS_DUP_REJECT_THRESHOLD=0.95
# AI_QUESTIONS_DUP_REVIEW_THRESHOLD=0.85
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
