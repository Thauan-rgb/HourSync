const Certificado = require('../models/Certificado');
const Usuario     = require('../models/Usuario');
const Curso       = require('../models/Curso');

/* ─── GET /dashboard/admin ────────────────────────── */
async function admin(_req, res) {
  try {
    const [totalAlunos, totalCoordenadores, totalCursos, certificados] = await Promise.all([
      Usuario.countDocuments({ role: 'ALUNO' }),
      Usuario.countDocuments({ role: 'COORDENADOR' }),
      Curso.countDocuments({ ativo: true }),
      Certificado.find().populate('aluno curso')
    ]);

    const pendentes  = certificados.filter(c => c.status === 'PENDENTE').length;
    const aprovados  = certificados.filter(c => c.status === 'APROVADO').length;
    const rejeitados = certificados.filter(c => c.status === 'REJEITADO').length;

    // Certificados por curso
    const porCurso = {};
    certificados.forEach(c => {
      if (!c.curso) return;
      const nome = c.curso.nome;
      if (!porCurso[nome]) porCurso[nome] = { pendentes: 0, aprovados: 0, rejeitados: 0 };
      porCurso[nome][c.status.toLowerCase() + 's']++;
    });

    return res.status(200).json({
      totalAlunos,
      totalCoordenadores,
      totalCursos,
      certificados: { total: certificados.length, pendentes, aprovados, rejeitados },
      porCurso
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro no dashboard admin.', error: err.message });
  }
}

/* ─── GET /dashboard/coordenador/:cursoId ─────────── */
async function coordenador(req, res) {
  try {
    const { cursoId } = req.params;

    const [alunos, certificados] = await Promise.all([
      Usuario.find({ role: 'ALUNO', cursoId }).countDocuments(),
      Certificado.find({ curso: cursoId }).populate('aluno')
    ]);

    const pendentes   = certificados.filter(c => c.status === 'PENDENTE').length;
    const aprovados   = certificados.filter(c => c.status === 'APROVADO').length;
    const rejeitados  = certificados.filter(c => c.status === 'REJEITADO').length;
    const totalHorasAprovadas = certificados
      .filter(c => c.status === 'APROVADO')
      .reduce((acc, c) => acc + (c.horasAprovadas || 0), 0);

    return res.status(200).json({
      alunos,
      certificados: { total: certificados.length, pendentes, aprovados, rejeitados },
      totalHorasAprovadas
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro no dashboard coordenador.', error: err.message });
  }
}

module.exports = { admin, coordenador };
