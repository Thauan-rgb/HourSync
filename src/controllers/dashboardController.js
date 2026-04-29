const Usuario = require("../models/Usuario");
const Curso = require("../models/Curso");
const Certificado = require("../models/Certificado");

// GET /dashboard/admin
const admin = async (req, res) => {
  try {
    const [
      totalAlunos,
      totalCoordenadores,
      totalCursos,
      totalCertificados,
      certificadosPendentes,
      certificadosAprovados,
      certificadosRejeitados,
    ] = await Promise.all([
      Usuario.countDocuments({ role: "ALUNO" }),
      Usuario.countDocuments({ role: "COORDENADOR" }),
      Curso.countDocuments({ ativo: true }),
      Certificado.countDocuments(),
      Certificado.countDocuments({ status: "Pendente" }),
      Certificado.countDocuments({ status: "Aprovado" }),
      Certificado.countDocuments({ status: "Rejeitado" }),
    ]);

    // Últimos 5 certificados submetidos
    const ultimosCertificados = await Certificado.find()
      .populate("aluno", "nome matricula")
      .populate("curso", "nome")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalAlunos,
      totalCoordenadores,
      totalCursos,
      totalCertificados,
      certificadosPendentes,
      certificadosAprovados,
      certificadosRejeitados,
      ultimosCertificados,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao carregar dashboard admin." });
  }
};

// GET /dashboard/coordenador/:cursoId
const coordenador = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const [
      totalAlunos,
      certificadosPendentes,
      certificadosAprovados,
      certificadosRejeitados,
    ] = await Promise.all([
      Usuario.countDocuments({ role: "ALUNO", curso: cursoId }),
      Certificado.countDocuments({ curso: cursoId, status: "Pendente" }),
      Certificado.countDocuments({ curso: cursoId, status: "Aprovado" }),
      Certificado.countDocuments({ curso: cursoId, status: "Rejeitado" }),
    ]);

    // Alunos com progresso
    const alunos = await Usuario.find({ role: "ALUNO", curso: cursoId })
      .populate("curso", "nome totalHorasExigidas")
      .limit(10);

    const alunosComProgresso = await Promise.all(
      alunos.map(async (aluno) => {
        const horasCumpridas = await Certificado.aggregate([
          { $match: { aluno: aluno._id, status: "Aprovado" } },
          { $group: { _id: null, total: { $sum: "$horasAprovadas" } } },
        ]);
        return {
          _id: aluno._id,
          nome: aluno.nome,
          matricula: aluno.matricula,
          turma: aluno.turma,
          horasCumpridas: horasCumpridas[0]?.total || 0,
          horasNecessarias: aluno.curso?.totalHorasExigidas || 100,
        };
      })
    );

    res.json({
      totalAlunos,
      certificadosPendentes,
      certificadosAprovados,
      certificadosRejeitados,
      alunos: alunosComProgresso,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao carregar dashboard do coordenador." });
  }
};

module.exports = { admin, coordenador };
