# HourSync — Backend Node.js + MongoDB

Backend completo para o sistema HourSync de gestão de atividades complementares.

## Tecnologias
- Node.js + Express
- MongoDB Atlas (banco de dados)
- JWT para autenticação
- Multer para upload de arquivos
- Deploy: Render

---

## Estrutura de arquivos

```
hoursync-backend/
├── server.js                     ← Ponto de entrada
├── package.json
├── .env.example                  ← Copie para .env
├── src/
│   ├── config/
│   │   └── db.js                 ← Conexão MongoDB
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Curso.js
│   │   └── Certificado.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   ├── cursoController.js
│   │   ├── certificadoController.js
│   │   ├── dashboardController.js
│   │   └── uploadController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── usuarioRoutes.js
│   │   ├── cursoRoutes.js
│   │   ├── certificadoRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── uploadRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   └── utils/
│       └── seed.js               ← Popula o banco com dados iniciais
├── api_frontend_atualizado.js    ← Cole em shared/api.js do frontend
└── login_frontend_atualizado.js  ← Cole em login/login.js do frontend
```

---

## Rotas da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/login | Login |
| PUT | /auth/reset-senha | Redefinir senha |
| GET | /auth/me | Usuário logado |

### Usuários
| Método | Rota | Acesso |
|--------|------|--------|
| GET | /usuarios | Admin |
| GET | /usuarios/coordenadores | Admin |
| GET | /usuarios/alunos | Admin, Coord |
| GET | /usuarios/:id | Autenticado |
| POST | /usuarios | Admin |
| PUT | /usuarios/:id | Próprio ou Admin |
| PUT | /usuarios/:id/ativo | Admin |
| PUT | /usuarios/:id/senha | Próprio ou Admin |
| DELETE | /usuarios/:id | Admin |

### Cursos
| Método | Rota | Acesso |
|--------|------|--------|
| GET | /cursos | Autenticado |
| GET | /cursos/:id | Autenticado |
| POST | /cursos | Admin |
| PUT | /cursos/:id | Admin, Coord |
| DELETE | /cursos/:id | Admin |

### Certificados
| Método | Rota | Acesso |
|--------|------|--------|
| GET | /certificados | Admin, Coord |
| GET | /certificados/:id | Autenticado |
| GET | /certificados/aluno/:alunoId | Autenticado |
| GET | /certificados/curso/:cursoId | Admin, Coord |
| GET | /certificados/status/:status | Admin, Coord |
| POST | /certificados | Autenticado |
| PATCH | /certificados/:id/validar | Admin, Coord |
| DELETE | /certificados/:id | Admin |

### Dashboard
| Método | Rota | Acesso |
|--------|------|--------|
| GET | /dashboard/admin | Admin |
| GET | /dashboard/coordenador/:cursoId | Admin, Coord |

### Upload
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /upload | Envia arquivo (PDF/JPG/PNG) |

---

## Como subir o banco (MongoDB Atlas)

1. Acesse https://cloud.mongodb.com
2. Crie um cluster gratuito (M0)
3. Em **Database Access**: crie um usuário com senha
4. Em **Network Access**: adicione `0.0.0.0/0` (permitir todos)
5. Em **Connect → Drivers**, copie a connection string
6. Cole em `MONGODB_URI` no `.env` ou nas variáveis de ambiente do Render

---

## Como fazer deploy no Render

1. Suba o código para um repositório GitHub (apenas a pasta `hoursync-backend`)
2. Em https://render.com → **New Web Service**
3. Conecte o repositório
4. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Em **Environment Variables**, adicione:
   ```
   MONGODB_URI     = (cole sua string do MongoDB)
   JWT_SECRET      = (qualquer string longa aleatória)
   JWT_EXPIRES_IN  = 7d
   FRONTEND_URL    = (URL do seu site no Netlify)
   ```
6. Clique em **Deploy**
7. Após deploy, copie a URL gerada (ex: https://hoursync-api.onrender.com)

---

## Como ligar o frontend ao backend

### Passo 1 — Atualizar api.js no frontend
Abra o arquivo `v31/v27_fixed/shared/api.js` e substitua a primeira linha de configuração:

```javascript
// ANTES (Spring Boot):
const API_BASE = "https://hoursync-backend.onrender.com";

// DEPOIS (seu novo backend Node):
const API_BASE = "https://SEU-SERVICO.onrender.com";  // ← URL do Render
```

**OU** substitua o arquivo inteiro pelo conteúdo de `api_frontend_atualizado.js` (já inclui todos os novos endpoints).

### Passo 2 — Atualizar login.js no frontend
Substitua o conteúdo de `v31/v27_fixed/login/login.js` pelo conteúdo de `login_frontend_atualizado.js`.

### Passo 3 — Deploy no Netlify
1. Suba a pasta `v31/v27_fixed/` para um repositório GitHub
2. Em https://netlify.com → **Add new site → Import from Git**
3. Selecione o repositório
4. Clique em **Deploy**
5. Copie a URL gerada (ex: https://hoursync.netlify.app)
6. Cole essa URL na variável `FRONTEND_URL` no Render

---

## Primeiros passos após o deploy

### Popular o banco com dados iniciais (seed)
```bash
# No servidor local, com .env configurado:
npm run seed
```

Isso cria:
- 4 cursos (ADS, Jogos Digitais, IoT, Gastronomia)
- 1 admin: admin@faculdade.edu.br / admin123
- 2 coordenadores: amelara@gmail.com / coord123
- 5 alunos de exemplo

---

## Desenvolvimento local

```bash
# Clone o projeto
npm install

# Crie o .env (copie de .env.example e preencha)
cp .env.example .env

# Rode em modo desenvolvimento
npm run dev

# Popule o banco
npm run seed
```
