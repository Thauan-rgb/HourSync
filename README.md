# HourSync — Backend

API REST Node.js + Express + MongoDB para o sistema de Gestão de Atividades Complementares da Faculdade Senac PE.

---

## Stack

| Tecnologia  | Versão  |
|-------------|---------|
| Node.js     | ≥ 18    |
| Express     | 4.x     |
| Mongoose    | 8.x     |
| JWT         | 9.x     |
| bcrypt      | 5.x     |
| Multer      | 1.x     |

---

## Estrutura

```
hoursync-backend/
├── server.js
├── package.json
├── .env.example
├── uploads/               ← arquivos de certificados (gerado em runtime)
└── src/
    ├── config/db.js
    ├── models/
    │   ├── Usuario.js
    │   ├── Curso.js
    │   ├── Categoria.js
    │   └── Certificado.js
    ├── controllers/
    │   ├── authController.js
    │   ├── usuarioController.js
    │   ├── cursoController.js
    │   ├── categoriaController.js
    │   ├── certificadoController.js
    │   ├── dashboardController.js
    │   ├── progressoController.js
    │   └── uploadController.js
    ├── routes/            ← uma rota por recurso
    ├── middlewares/
    │   ├── authMiddleware.js
    │   └── roleMiddleware.js
    ├── utils/token.js
    └── seed.js            ← popula admin + cursos + categorias
```

---

## Variáveis de ambiente

Crie um arquivo `.env` a partir do `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/hoursync
JWT_SECRET=chave_super_secreta_aqui
NODE_ENV=production
FRONTEND_URL=https://seu-site.netlify.app
BACKEND_URL=https://hoursync-backend.onrender.com
```

---

## Rodando localmente

```bash
npm install
cp .env.example .env
# edite .env com suas credenciais
node src/seed.js     # cria admin, cursos e categorias
npm run dev          # nodemon
```

---

## Deploy no Render

### 1. Crie o serviço Web no Render
- **Repository**: aponte para este repositório
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment**: Node

### 2. Adicione as variáveis de ambiente no painel do Render
```
MONGO_URI        = <string do MongoDB Atlas>
JWT_SECRET       = <string longa e aleatória>
FRONTEND_URL     = https://seu-site.netlify.app
BACKEND_URL      = https://hoursync-backend.onrender.com
NODE_ENV         = production
```

### 3. Rode o seed (uma vez) via Render Shell
No painel do Render → seu serviço → aba **Shell**:
```bash
node src/seed.js
```
Isso cria: `admin@faculdade.edu.br` / `admin123`, os 4 cursos e as 3 categorias do Manual.

---

## Deploy do frontend no Netlify

1. Faça upload da pasta `v27_fixed/` no Netlify (drag & drop ou conecte o repositório)
2. Em `shared/api.js`, atualize a URL base:
```js
const API_BASE = "https://hoursync-backend.onrender.com";
```
3. Em `login/login.js`, substitua a validação local pelo `Auth.login()` da api.js

---

## Rotas da API

### AUTH
| Método | Endpoint              | Acesso  |
|--------|-----------------------|---------|
| POST   | /auth/login           | Público |
| PUT    | /auth/reset-senha     | Público |
| GET    | /auth/me              | Logado  |

### USUÁRIOS `/usuarios`
| Método | Endpoint              | Roles               |
|--------|-----------------------|---------------------|
| GET    | /                     | SUPER_ADMIN         |
| GET    | /coordenadores        | SUPER_ADMIN, COORD  |
| GET    | /alunos               | SUPER_ADMIN, COORD  |
| GET    | /:id                  | SUPER_ADMIN, COORD  |
| POST   | /                     | SUPER_ADMIN         |
| PUT    | /:id                  | SUPER_ADMIN         |
| PUT    | /:id/ativo?ativo=true | SUPER_ADMIN         |
| PATCH  | /:id/senha            | SUPER_ADMIN         |
| DELETE | /:id                  | SUPER_ADMIN         |

### CURSOS `/cursos`
| Método | Endpoint | Roles               |
|--------|----------|---------------------|
| GET    | /        | Logado              |
| GET    | /:id     | Logado              |
| POST   | /        | SUPER_ADMIN         |
| PUT    | /:id     | SUPER_ADMIN         |
| DELETE | /:id     | SUPER_ADMIN         |

### CATEGORIAS `/categorias`
| Método | Endpoint           | Roles       |
|--------|--------------------|-------------|
| GET    | /                  | Logado      |
| GET    | /curso/:cursoId    | Logado      |
| GET    | /:id               | Logado      |
| POST   | /                  | SUPER_ADMIN |
| PUT    | /:id               | SUPER_ADMIN |
| DELETE | /:id               | SUPER_ADMIN |

### CERTIFICADOS `/certificados`
| Método | Endpoint               | Roles               |
|--------|------------------------|---------------------|
| GET    | /                      | SUPER_ADMIN, COORD  |
| GET    | /aluno/:alunoId        | Logado              |
| GET    | /curso/:cursoId        | SUPER_ADMIN, COORD  |
| GET    | /status/:status        | SUPER_ADMIN, COORD  |
| GET    | /:id                   | Logado              |
| POST   | /                      | Logado (submissão)  |
| PUT    | /:id                   | Logado              |
| PATCH  | /:certId/validar       | SUPER_ADMIN, COORD  |
| DELETE | /:id                   | SUPER_ADMIN         |

`PATCH /certificados/:certId/validar?status=APROVADO&coordenadorId=xxx&motivo=xxx`

### UPLOAD `/upload`
| Método | Endpoint | Notas                      |
|--------|----------|----------------------------|
| POST   | /        | multipart/form-data, campo `file` |

### DASHBOARD `/dashboard`
| Método | Endpoint                  | Roles               |
|--------|---------------------------|---------------------|
| GET    | /admin                    | SUPER_ADMIN         |
| GET    | /coordenador/:cursoId     | SUPER_ADMIN, COORD  |

### PROGRESSO `/progresso`
| Método | Endpoint            | Roles  |
|--------|---------------------|--------|
| GET    | /aluno/:alunoId     | Logado |
| GET    | /curso/:cursoId     | Logado |
| GET    | /calculo/:certId    | Logado |

---

## Credenciais padrão (após seed)
```
Email: admin@faculdade.edu.br
Senha: admin123
Role:  SUPER_ADMIN
```
> **Troque a senha após o primeiro login!**
