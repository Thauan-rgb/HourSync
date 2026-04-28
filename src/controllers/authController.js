const Usuario      = require('../models/Usuario');
const { gerarToken } = require('../utils/token');

/* ── POST /auth/login ─────────────────────────────── */
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+senha');

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    if (!usuario.ativo) {
      return res.status(403).json({ message: 'Usuário inativo. Entre em contato com o administrador.' });
    }

    const senhaOk = await usuario.compararSenha(senha);
    if (!senhaOk) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = gerarToken(usuario);

    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      token,
      usuario: {
        id:        usuario._id,
        nome:      usuario.nome,
        email:     usuario.email,
        role:      usuario.role,
        foto:      usuario.foto,
        cursoId:   usuario.cursoId,
        cursosIds: usuario.cursosIds,
        matricula: usuario.matricula
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao realizar login.', error: err.message });
  }
}

/* ── PUT /auth/reset-senha?email=&novaSenha= ──────── */
async function resetSenha(req, res) {
  try {
    const { email, novaSenha } = req.query;

    if (!email || !novaSenha) {
      return res.status(400).json({ message: 'Email e novaSenha são obrigatórios.' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter ao menos 6 caracteres.' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+senha');
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    usuario.senha = novaSenha;
    await usuario.save();

    return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao redefinir senha.', error: err.message });
  }
}

/* ── GET /auth/me ─────────────────────────────────── */
async function me(req, res) {
  try {
    const usuario = await Usuario.findById(req.usuario.id).populate('cursoId cursosIds');
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.status(200).json(usuario);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao buscar perfil.', error: err.message });
  }
}

module.exports = { login, resetSenha, me };
