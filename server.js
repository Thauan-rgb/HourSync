require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./src/config/db");

// ── Rotas ──────────────────────────────────────────────────────────
const authRoutes         = require("./src/routes/authRoutes");
const usuarioRoutes      = require("./src/routes/usuarioRoutes");
const cursoRoutes        = require("./src/routes/cursoRoutes");
const certificadoRoutes  = require("./src/routes/certificadoRoutes");
const dashboardRoutes    = require("./src/routes/dashboardRoutes");
const uploadRoutes       = require("./src/routes/uploadRoutes");

// ── App ────────────────────────────────────────────────────────────
const app = express();

// ── CORS ───────────────────────────────────────────────────────────
// ► COLE A URL DO SEU FRONTEND NO NETLIFY na variável FRONTEND_URL do .env
const origensPermitidas = [
  process.env.FRONTEND_URL,        // URL do Netlify (ex: https://hoursync.netlify.app)
  "http://localhost:3000",          // dev local
  "http://localhost:5500",          // Live Server
  "http://127.0.0.1:5500",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem origin (ex: Postman, mobile)
      if (!origin) return callback(null, true);
      if (origensPermitidas.includes(origin)) return callback(null, true);
      callback(new Error(`CORS bloqueado para: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ── Middlewares globais ────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve arquivos de upload publicamente
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ── Rotas da API ───────────────────────────────────────────────────
app.use("/auth",         authRoutes);
app.use("/usuarios",     usuarioRoutes);
app.use("/cursos",       cursoRoutes);
app.use("/certificados", certificadoRoutes);
app.use("/dashboard",    dashboardRoutes);
app.use("/upload",       uploadRoutes);

// ── Rota de health check (útil para o Render não hibernar) ─────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 handler ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

// ── Error handler global ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({ message: err.message || "Erro interno no servidor." });
});

// ── Inicia servidor ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 HourSync Backend rodando na porta ${PORT}`);
  });
});
