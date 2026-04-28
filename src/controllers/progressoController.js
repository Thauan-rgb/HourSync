const Certificado = require('../models/Certificado');
const Usuario     = require('../models/Usuario');
const Curso       = require('../models/Curso');

/* ─── GET /progresso/aluno/:alunoId ──────────────── */
async function porAluno(req, res) {
  try {
    const aluno = await Usuario.findById(req.params.alunoId).populate('cursoId');
    if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado.' });

    const certificados = await Certificado.find({
      aluno:  aluno._id,
      status: 'APROVADO'
    });

    const horasCumpridas  = certificados.reduce((acc, c) => acc + (c.horasAprovadas || 0), 0);
    const horasNecessarias = aluno.cursoId?.horasExigidas || 0;
    const percentual       = horasNecessarias > 0
      ? Math.min(Math.round((horasCumpridas / horasNecessarias) * 100), 100)
      : 0;

    return res.status(200).json({
      aluno: { id: aluno._id, nome: aluno.nome, matricula: aluno.matricula },
      curso: aluno.cursoId,
      horasCumpridas,
      horasNecessarias,
      percentual,
      certificados: certificados.length
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao buscar progresso.', error: err.message });
  }
}

/* ─── GET /progresso/curso/:cursoId ──────────────── */
async function porCurso(req, res) {
  try {
    const alunos = await Usuario.find({ role: 'ALUNO', cursoId: req.params.cursoId }).populate('cursoId');
    const curso  = await Curso.findById(req.params.cursoId);

    const progressos = await Promise.all(alunos.map(async aluno => {
      const certs = await Certificado.find({ aluno: aluno._id, status: 'APROVADO' });
      const horas = certs.reduce((acc, c) => acc + (c.horasAprovadas || 0), 0);
      const necessarias = curso?.horasExigidas || 0;
      return {
        alunoId:          aluno._id,
        nome:             aluno.nome,
        matricula:        aluno.matricula,
        horasCumpridas:   horas,
        horasNecessarias: necessarias,
        percentual:       necessarias > 0 ? Math.min(Math.round((horas / necessarias) * 100), 100) : 0,
        status:           horas >= necessarias ? 'Concluído' : 'Em Andamento'
      };
    }));

    return res.status(200).json({ curso, progressos });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao buscar progresso do curso.', error: err.message });
  }
}

/* ─── GET /progresso/calculo/:certId ─────────────── */
async function calculo(req, res) {
  try {
    const cert = await Certificado.findById(req.params.certId).populate('aluno curso');
    if (!cert) return res.status(404).json({ message: 'Certificado não encontrado.' });

    const aprovados = await Certificado.find({
      aluno:    cert.aluno._id,
      status:   'APROVADO',
      semestre: cert.semestre || { $exists: false }
    });

    const horasUsadas     = aprovados.reduce((acc, c) => acc + (c.horasAprovadas || 0), 0);
    const horasPorSem     = cert.curso?.horasPorSemestre || 25;
    const disponivel      = Math.max(0, horasPorSem - horasUsadas);
    const horasAprovadas  = Math.min(cert.horas, disponivel);

    return res.status(200).json({
      horas:           cert.horas,
      horasUsadas,
      disponivel,
      horasAprovadas,
      horasPorSemestre: horasPorSem
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro no cálculo.', error: err.message });
  }
}

module.exports = { porAluno, porCurso, calculo };
