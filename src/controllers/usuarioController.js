const Usuario = require('../models/Usuario');
const { gerarToken } = require('../utils/token');

/* ── GET /usuarios ────────────────────────────────── */
async function listar(req, res) {
  try {
    const usuarios = await Usuario.find().populate('cursoId cursosIds').sort({ createdAt: -1 });
    return res.status(200).json(usuarios);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar usuários.', error: err.message });
  }
}

/* ── GET /usuarios/coordenadores ──────────────────── */
async function listarCoordenadores(req, res) {
  try {
    const lista = await Usuario.find({ role: 'COORDENADOR' }).populate('cursoId cursosIds').sort({ nome: 1 });
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar coordenadores.', error: err.message });
  }
}

/* ── GET /usuarios/alunos ─────────────────────────── */
async function listarAlunos(req, res) {
  try {
    const lista = await Usuario.find({ role: 'ALUNO' }).populate('cursoId').sort({ nome: 1 });
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar alunos.', error: err.message });
  }
}

/* ── GET /usuarios/:id ────────────────────────────── */
async function buscarPorId(req, res) {
  try {
    const usuario = await Usuario.findById(req.params.id).populate('cursoId cursosIds');
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.status(200).json(usuario);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao buscar usuário.', error: err.message });
  }
}

/* ── POST /usuarios ───────────────────────────────── */
async function criar(req, res) {
  try {
    const { nome, email, senha, cpf, matricula, role, cursoId, cursosIds, celular, faculdade } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    const existe = await Usuario.findOne({ email: email.toLowerCase() });
    if (existe) return res.status(409).json({ message: 'Já existe um usuário com esse email.' });

    const usuario = await Usuario.create({
      nome, email, senha,
      cpf:       cpf       || null,
      matricula: matricula || null,
      role:      role      || 'ALUNO',
      cursoId:   cursoId   || null,
      cursosIds: cursosIds || [],
      celular:   celular   || null,
      faculdade: faculdade || 'Faculdade Senac PE'
    });

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      usuario: {
        id:        usuario._id,
        nome:      usuario.nome,
        email:     usuario.email,
        role:      usuario.role,
        matricula: usuario.matricula
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao criar usuário.', error: err.message });
  }
}

/* ── PUT /usuarios/:id ────────────────────────────── */
async function atualizar(req, res) {
  try {
    const { nome, email, cpf, matricula, role, cursoId, cursosIds, celular, faculdade, foto } = req.body;

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

    usuario.nome      = nome      ?? usuario.nome;
    usuario.email     = email     ?? usuario.email;
    usuario.cpf       = cpf       ?? usuario.cpf;
    usuario.matricula = matricula ?? usuario.matricula;
    usuario.role      = role      ?? usuario.role;
    usuario.cursoId   = cursoId   ?? usuario.cursoId;
    usuario.cursosIds = cursosIds ?? usuario.cursosIds;
    usuario.celular   = celular   ?? usuario.celular;
    usuario.faculdade = faculdade ?? usuario.faculdade;
    usuario.foto      = foto      ?? usuario.foto;

    await usuario.save();
    return res.status(200).json({ message: 'Usuário atualizado com sucesso.', usuario });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao atualizar usuário.', error: err.message });
  }
}

/* ── PUT /usuarios/:id/ativo?ativo=true|false ──────── */
async function ativarInativar(req, res) {
  try {
    const ativo = req.query.ativo === 'true';
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { ativo },
      { new: true }
    );
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.status(200).json({
      message: `Usuário ${ativo ? 'ativado' : 'inativado'} com sucesso.`,
      usuario
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao alterar status.', error: err.message });
  }
}

/* ── PATCH /usuarios/:id/senha ────────────────────── */
async function atualizarSenha(req, res) {
  try {
    const { senha } = req.body;

    if (!senha || senha.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter ao menos 6 caracteres.' });
    }

    const usuario = await Usuario.findById(req.params.id).select('+senha');
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

    usuario.senha = senha;
    await usuario.save();

    return res.status(200).json({ message: 'Senha atualizada com sucesso.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao atualizar senha.', error: err.message });
  }
}

/* ── DELETE /usuarios/:id ─────────────────────────── */
async function remover(req, res) {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.status(200).json({ message: 'Usuário removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao remover usuário.', error: err.message });
  }
}

module.exports = {
  listar,
  listarCoordenadores,
  listarAlunos,
  buscarPorId,
  criar,
  atualizar,
  ativarInativar,
  atualizarSenha,
  remover
};
