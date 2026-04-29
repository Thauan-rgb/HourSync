const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// Gera token JWT
const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ──────────────────────────────────────────
// POST /auth/login
// ──────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res
        .status(400)
        .json({ message: "Email e senha são obrigatórios." });
    }

    // Busca usuário com senha (select: false no model)
    const usuario = await Usuario.findOne({ email: email.toLowerCase() })
      .select("+senha")
      .populate("curso", "nome codigo")
      .populate("cursos", "nome codigo");

    if (!usuario) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    if (!usuario.ativo) {
      return res.status(401).json({ message: "Conta inativa. Entre em contato com o administrador." });
    }

    const senhaOk = await usuario.compararSenha(senha);
    if (!senhaOk) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    const token = gerarToken(usuario._id);

    // Remove senha da resposta
    const usuarioResp = usuario.toObject();
    delete usuarioResp.senha;

    res.json({
      token,
      usuario: usuarioResp,
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
};

// ──────────────────────────────────────────
// PUT /auth/reset-senha
// Body: { email, novaSenha }
// ──────────────────────────────────────────
const resetSenha = async (req, res) => {
  try {
    const { email, novaSenha } = req.body;

    if (!email || !novaSenha) {
      return res.status(400).json({ message: "Email e nova senha são obrigatórios." });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() });
    if (!usuario) {
      // Resposta genérica por segurança
      return res.json({ message: "Se o email existir, a senha será redefinida." });
    }

    usuario.senha = novaSenha; // o pre-save faz o hash
    await usuario.save();

    res.json({ message: "Senha redefinida com sucesso." });
  } catch (err) {
    console.error("Erro no reset de senha:", err);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
};

// ──────────────────────────────────────────
// GET /auth/me  — retorna o usuário logado
// ──────────────────────────────────────────
const me = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id)
      .populate("curso", "nome codigo totalHorasExigidas limiteSemestral")
      .populate("cursos", "nome codigo");

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ message: "Erro interno no servidor." });
  }
};

module.exports = { login, resetSenha, me };
