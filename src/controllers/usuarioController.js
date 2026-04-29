const Usuario = require("../models/Usuario");
const Certificado = require("../models/Certificado");

// ──────────────────────────────────────────
// GET /usuarios  — lista todos (admin)
// ──────────────────────────────────────────
const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .populate("curso", "nome codigo")
      .populate("cursos", "nome codigo")
      .sort({ createdAt: -1 });

    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar usuários." });
  }
};

// ──────────────────────────────────────────
// GET /usuarios/coordenadores
// ──────────────────────────────────────────
const listarCoordenadores = async (req, res) => {
  try {
    const coordenadores = await Usuario.find({ role: "COORDENADOR" })
      .populate("cursos", "nome codigo")
      .sort({ nome: 1 });

    res.json(coordenadores);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar coordenadores." });
  }
};

// ──────────────────────────────────────────
// GET /usuarios/alunos
// ──────────────────────────────────────────
const listarAlunos = async (req, res) => {
  try {
    const alunos = await Usuario.find({ role: "ALUNO" })
      .populate("curso", "nome codigo totalHorasExigidas limiteSemestral")
      .sort({ nome: 1 });

    // Calcula horas cumpridas de cada aluno
    const alunosComHoras = await Promise.all(
      alunos.map(async (aluno) => {
        const horasCumpridas = await Certificado.aggregate([
          {
            $match: {
              aluno: aluno._id,
              status: "Aprovado",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$horasAprovadas" },
            },
          },
        ]);

        const obj = aluno.toObject();
        obj.horasCumpridas = horasCumpridas[0]?.total || 0;
        obj.horasNecessarias = aluno.curso?.totalHorasExigidas || 100;
        obj.horasSemestreAtual = aluno.horasSemestre || 0;
        return obj;
      })
    );

    res.json(alunosComHoras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar alunos." });
  }
};

// ──────────────────────────────────────────
// GET /usuarios/:id
// ──────────────────────────────────────────
const buscarPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
      .populate("curso", "nome codigo totalHorasExigidas limiteSemestral categorias")
      .populate("cursos", "nome codigo");

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar usuário." });
  }
};

// ──────────────────────────────────────────
// POST /usuarios  — cria usuário
// Body: { nome, email, senha, cpf, matricula, role, cursoId, cursos, turma }
// ──────────────────────────────────────────
const criar = async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      cpf,
      matricula,
      role,
      cursoId,
      cursos,
      turma,
      celular,
      faculdade,
    } = req.body;

    const emailExistente = await Usuario.findOne({ email: email?.toLowerCase() });
    if (emailExistente) {
      return res.status(400).json({ message: "Email já cadastrado." });
    }

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha,
      cpf,
      matricula,
      role: role || "ALUNO",
      curso: cursoId || null,
      cursos: cursos || [],
      turma,
      celular,
      faculdade,
    });

    const usuarioResp = await Usuario.findById(novoUsuario._id)
      .populate("curso", "nome codigo")
      .populate("cursos", "nome codigo");

    res.status(201).json(usuarioResp);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email ou matrícula já cadastrados." });
    }
    console.error(err);
    res.status(500).json({ message: "Erro ao criar usuário." });
  }
};

// ──────────────────────────────────────────
// PUT /usuarios/:id  — atualiza dados do perfil
// ──────────────────────────────────────────
const atualizar = async (req, res) => {
  try {
    const { nome, email, celular, faculdade, foto, cursoId, cursos, turma, matricula } =
      req.body;

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Apenas o próprio usuário ou admin pode editar
    const ehAdmin = req.usuario.role === "SUPER_ADMIN";
    const ehProprioUsuario = req.usuario._id.toString() === req.params.id;

    if (!ehAdmin && !ehProprioUsuario) {
      return res.status(403).json({ message: "Sem permissão para editar este usuário." });
    }

    if (nome) usuario.nome = nome;
    if (email) usuario.email = email.toLowerCase();
    if (celular !== undefined) usuario.celular = celular;
    if (faculdade !== undefined) usuario.faculdade = faculdade;
    if (foto !== undefined) usuario.foto = foto;
    if (turma !== undefined) usuario.turma = turma;
    if (matricula !== undefined) usuario.matricula = matricula;
    if (cursoId !== undefined) usuario.curso = cursoId || null;
    if (cursos !== undefined) usuario.cursos = cursos;

    await usuario.save();

    const usuarioAtualizado = await Usuario.findById(usuario._id)
      .populate("curso", "nome codigo")
      .populate("cursos", "nome codigo");

    res.json(usuarioAtualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar usuário." });
  }
};

// ──────────────────────────────────────────
// PUT /usuarios/:id/ativo  — ativa/inativa
// Query: ?ativo=true|false
// ──────────────────────────────────────────
const ativarInativar = async (req, res) => {
  try {
    const ativo = req.query.ativo === "true";

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { ativo },
      { new: true }
    ).populate("curso", "nome codigo").populate("cursos", "nome codigo");

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ message: "Erro ao atualizar status do usuário." });
  }
};

// ──────────────────────────────────────────
// PUT /usuarios/:id/senha  — altera senha
// Body: { senhaAtual, novaSenha }
// ──────────────────────────────────────────
const alterarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    const usuario = await Usuario.findById(req.params.id).select("+senha");
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Admin pode trocar sem informar senha atual
    const ehAdmin = req.usuario.role === "SUPER_ADMIN";

    if (!ehAdmin) {
      if (!senhaAtual) {
        return res.status(400).json({ message: "Senha atual é obrigatória." });
      }
      const senhaOk = await usuario.compararSenha(senhaAtual);
      if (!senhaOk) {
        return res.status(401).json({ message: "Senha atual incorreta." });
      }
    }

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ message: "Nova senha deve ter ao menos 6 caracteres." });
    }

    usuario.senha = novaSenha;
    await usuario.save();

    res.json({ message: "Senha alterada com sucesso." });
  } catch (err) {
    res.status(500).json({ message: "Erro ao alterar senha." });
  }
};

// ──────────────────────────────────────────
// DELETE /usuarios/:id
// ──────────────────────────────────────────
const remover = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Erro ao remover usuário." });
  }
};

module.exports = {
  listar,
  listarCoordenadores,
  listarAlunos,
  buscarPorId,
  criar,
  atualizar,
  ativarInativar,
  alterarSenha,
  remover,
};
