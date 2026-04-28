require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const connectDB = require('./src/config/db');

const authRoutes        = require('./src/routes/authRoutes');
const usuarioRoutes     = require('./src/routes/usuarioRoutes');
const cursoRoutes       = require('./src/routes/cursoRoutes');
const categoriaRoutes   = require('./src/routes/categoriaRoutes');
const certificadoRoutes = require('./src/routes/certificadoRoutes');
const uploadRoutes      = require('./src/routes/uploadRoutes');
const dashboardRoutes   = require('./src/routes/dashboardRoutes');
const progressoRoutes   = require('./src/routes/progressoRoutes');

const app = express();

connectDB();

/* ── CORS ─────────────────────────────────────────── */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (ex: Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para origem: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Arquivos de upload servidos estaticamente ────── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── Rotas ────────────────────────────────────────── */
app.use('/auth',         authRoutes);
app.use('/usuarios',     usuarioRoutes);
app.use('/cursos',       cursoRoutes);
app.use('/categorias',   categoriaRoutes);
app.use('/certificados', certificadoRoutes);
app.use('/upload',       uploadRoutes);
app.use('/dashboard',    dashboardRoutes);
app.use('/progresso',    progressoRoutes);

/* ── Health check ─────────────────────────────────── */
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

/* ── 404 ──────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));

/* ── Erro global ──────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 HourSync rodando na porta ${PORT}`));
