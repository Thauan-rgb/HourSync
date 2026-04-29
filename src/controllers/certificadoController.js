const Certificado = require("../models/Certificado");
const Usuario = require("../models/Usuario");
const Curso = require("../models/Curso");

const LIMITE_SEMESTRAL_PADRAO = 25;

// ──────────────────────────────────────────
// Calcula horas aprovadas respeitando os limites
// ──────────────────────────────────────────
async function calcularHorasAprovadas(alunoId, horasSolicitadas, grupo, codigoAtividade, cursoId) {
  // Busca horas já usadas no semestre
  const aluno = await Usuario.findById(alunoId);
  const horasUtilizadas = aluno?.horasSemestre || 0;

  // Busca limite da subcategoria no curso
  let limiteSubcategoria = Infinity;
  if (cursoId) {
    const curso = await Curso.findById(cursoId);
    if (curso) {
      const cat = curso.categorias.find((c) => c.nome === grupo);
      if (cat) {
        const sub = cat.subcategorias.find((s) => s.codigo === codigoAtividade);
        if (sub) limiteSubcategoria = sub.limiteHoras;
      }
      const limiteSemestral = curso.limiteSemestral || LIMITE_SEMESTRAL_PADRAO;
      const disponivelSemestral = Math.max(0, limiteSemestral - horasUtilizadas);
      const aposLimiteSub = Math.min(horasSolicitadas, limiteSubcategoria);
      return Math.min(aposLimiteSub, disponivelSemestral);
    }
  }

  const disponivelSemestral = Math.max(0, LIMITE_SEMESTRAL_PADRAO - horasUtilizadas);
  const aposLimiteSub = Math.min(horasSolicitadas, limiteSubcategoria);
  return Math.min(aposLimiteSub, disponivelSemestral);
}

// GET /certificados
const listar = async (req, res) => {
  try {
    const certificados = await Certificado.find()
      .populate("aluno", "nome matricula turma")
      .populate("curso", "nome codigo")
      .populate("coordenadorValidador", "nome")
      .sort({ createdAt: -1 });

    res.json(certificados);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar certificados." });
  }
};

// GET /certificados/:id
const buscarPorId = async (req, res) => {
  try {
    const cert = await Certificado.findById(req.params.id)
      .populate("aluno", "nome matricula turma email")
      .populate("curso", "nome codigo categorias limiteSemestral")
      .populate("coordenadorValidador", "nome");

    if (!cert) return res.status(404).json({ message: "Certificado não encontrado." });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar certificado." });
  }
};

// GET /certificados/aluno/:alunoId
const listarPorAluno = async (req, res) => {
  try {
    const certificados = await Certificado.find({ aluno: req.params.alunoId })
      .populate("curso", "nome codigo")
      .populate("coordenadorValidador", "nome")
      .sort({ createdAt: -1 });

    res.json(certificados);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar certificados do aluno." });
  }
};

// GET /certificados/curso/:cursoId
const listarPorCurso = async (req, res) => {
  try {
    const certificados = await Certificado.find({ curso: req.params.cursoId })
      .populate("aluno", "nome matricula turma")
      .populate("coordenadorValidador", "nome")
      .sort({ createdAt: -1 });

    res.json(certificados);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar certificados do curso." });
  }
};

// GET /certificados/status/:status
const listarPorStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validos = ["Pendente", "Aprovado", "Rejeitado"];
    if (!validos.includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    // Coordenador só vê certificados dos seus cursos
    let filtro = { status };
    if (req.usuario.role === "COORDENADOR") {
      filtro.curso = { $in: req.usuario.cursos };
    }

    const certificados = await Certificado.find(filtro)
      .populate("aluno", "nome matricula turma")
      .populate("curso", "nome codigo")
      .populate("coordenadorValidador", "nome")
      .sort({ createdAt: -1 });

    res.json(certificados);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar certificados por status." });
  }
};

// POST /certificados  — aluno submete
const submeter = async (req, res) => {
  try {
    const {
      titulo,
      horas,
      grupo,
      codigoAtividade,
      descricaoAtividade,
      alunoId,
      cursoId,
      turma,
      arquivoUrl,
      semestre,
    } = req.body;

    // Se não informou alunoId, usa o usuário logado
    const idAluno = alunoId || req.usuario._id;

    const cert = await Certificado.create({
      titulo,
      aluno: idAluno,
      curso: cursoId,
      turma,
      grupo,
      codigoAtividade,
      descricaoAtividade,
      horasSolicitadas: horas,
      arquivoUrl: arquivoUrl || "",
      semestre,
    });

    const certPopulado = await Certificado.findById(cert._id)
      .populate("aluno", "nome matricula")
      .populate("curso", "nome codigo");

    res.status(201).json(certPopulado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao submeter certificado." });
  }
};

// PATCH /certificados/:id/validar
// Query: ?status=Aprovado|Rejeitado&coordenadorId=xxx&motivo=...
const validar = async (req, res) => {
  try {
    const { status, coordenadorId, motivo } = req.query;
    const validos = ["Aprovado", "Rejeitado"];

    if (!validos.includes(status)) {
      return res.status(400).json({ message: "Status inválido. Use Aprovado ou Rejeitado." });
    }

    const cert = await Certificado.findById(req.params.id).populate("aluno");
    if (!cert) return res.status(404).json({ message: "Certificado não encontrado." });

    if (cert.status !== "Pendente") {
      return res.status(400).json({ message: "Este certificado já foi validado." });
    }

    cert.status = status;
    cert.coordenadorValidador = coordenadorId || req.usuario._id;
    cert.dataValidacao = new Date();
    cert.motivoRejeicao = motivo || "";

    if (status === "Aprovado") {
      // Calcula horas que serão aprovadas
      const horasAprovadas = await calcularHorasAprovadas(
        cert.aluno._id,
        cert.horasSolicitadas,
        cert.grupo,
        cert.codigoAtividade,
        cert.curso
      );
      cert.horasAprovadas = horasAprovadas;

      // Atualiza horas do semestre do aluno
      await Usuario.findByIdAndUpdate(cert.aluno._id, {
        $inc: { horasSemestre: horasAprovadas },
      });
    } else {
      cert.horasAprovadas = null;
    }

    await cert.save();

    const certAtualizado = await Certificado.findById(cert._id)
      .populate("aluno", "nome matricula turma")
      .populate("curso", "nome codigo")
      .populate("coordenadorValidador", "nome");

    res.json(certAtualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao validar certificado." });
  }
};

// DELETE /certificados/:id
const remover = async (req, res) => {
  try {
    const cert = await Certificado.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ message: "Certificado não encontrado." });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Erro ao remover certificado." });
  }
};

module.exports = {
  listar,
  buscarPorId,
  listarPorAluno,
  listarPorCurso,
  listarPorStatus,
  submeter,
  validar,
  remover,
};
