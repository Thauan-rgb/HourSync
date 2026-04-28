const Certificado = require('../models/Certificado');
const Curso       = require('../models/Curso');
const Usuario     = require('../models/Usuario');

const POPULATE = 'aluno categoria curso coordenador';

/* ─── Helpers ─────────────────────────────────────── */
function calcularHorasAprovadas(horas, horasUsadas, limite, horasPorSemestre = 25) {
  const limSub     = limite != null ? limite : Infinity;
  const aposLim    = Math.min(horas, limSub);
  const disponivel = Math.max(0, horasPorSemestre - horasUsadas);
  return Math.min(aposLim, disponivel);
}

/* ─── Listar todos ────────────────────────────────── */
async function listar(_req, res) {
  try {
    const lista = await Certificado.find()
      .populate(POPULATE)
      .sort({ createdAt: -1 });
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar certificados.', error: err.message });
  }
}

/* ─── Listar por aluno ────────────────────────────── */
async function listarPorAluno(req, res) {
  try {
    const lista = await Certificado.find({ aluno: req.params.alunoId })
      .populate(POPULATE)
      .sort({ createdAt: -1 });
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar certificados.', error: err.message });
  }
}

/* ─── Listar por curso ────────────────────────────── */
async function listarPorCurso(req, res) {
  try {
    const lista = await Certificado.find({ curso: req.params.cursoId })
      .populate(POPULATE)
      .sort({ createdAt: -1 });
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar certificados.', error: err.message });
  }
}

/* ─── Listar por status ───────────────────────────── */
async function listarPorStatus(req, res) {
  try {
    const lista = await Certificado.find({ status: req.params.status.toUpperCase() })
      .populate(POPULATE)
      .sort({ createdAt: -1 });
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar certificados.', error: err.message });
  }
}

/* ─── Buscar por ID ───────────────────────────────── */
async function buscarPorId(req, res) {
  try {
    const cert = await Certificado.findById(req.params.id).populate(POPULATE);
    if (!cert) return res.status(404).json({ message: 'Certificado não encontrado.' });
    return res.status(200).json(cert);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao buscar certificado.', error: err.message });
  }
}

/* ─── Submeter (criar) ────────────────────────────── */
async function submeter(req, res) {
  try {
    const {
      titulo, horas, grupo, codigoAtividade, descricaoAtividade,
      aluno, categoria, curso, arquivoUrl, semestre
    } = req.body;

    if (!titulo || !horas || !aluno || !curso) {
      return res.status(400).json({ message: 'Título, horas, aluno e curso são obrigatórios.' });
    }

    const cert = await Certificado.create({
      titulo,
      horas,
      grupo:              grupo              || null,
      codigoAtividade:    codigoAtividade    || null,
      descricaoAtividade: descricaoAtividade || null,
      aluno:              aluno?.id          || aluno,
      categoria:          categoria?.id      || categoria || null,
      curso:              curso?.id          || curso,
      arquivoUrl:         arquivoUrl         || null,
      semestre:           semestre           || null,
      status: 'PENDENTE'
    });

    return res.status(201).json({ message: 'Certificado submetido com sucesso.', certificado: cert });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao submeter certificado.', error: err.message });
  }
}

/* ─── Validar (aprovar / rejeitar) ────────────────── */
async function validar(req, res) {
  try {
    const { certId }      = req.params;
    const { status, coordenadorId, motivo } = req.query;

    if (!['APROVADO', 'REJEITADO'].includes(status)) {
      return res.status(400).json({ message: 'Status deve ser APROVADO ou REJEITADO.' });
    }

    const cert = await Certificado.findById(certId).populate('aluno curso');
    if (!cert) return res.status(404).json({ message: 'Certificado não encontrado.' });

    if (status === 'APROVADO') {
      // Calcula horas já usadas pelo aluno neste semestre
      const semestre = cert.semestre || 'global';
      const query    = { aluno: cert.aluno._id, status: 'APROVADO' };
      if (cert.semestre) query.semestre = cert.semestre;

      const aprovados   = await Certificado.find(query);
      const horasUsadas = aprovados.reduce((acc, c) => acc + (c.horasAprovadas || 0), 0);

      const horasPorSemestre = cert.curso?.horasPorSemestre || 25;
      cert.horasAprovadas    = calcularHorasAprovadas(cert.horas, horasUsadas, null, horasPorSemestre);
    }

    cert.status         = status;
    cert.coordenador    = coordenadorId || null;
    cert.dataValidacao  = new Date();
    cert.motivoRejeicao = status === 'REJEITADO' ? (motivo || null) : null;

    await cert.save();

    return res.status(200).json({
      message: `Certificado ${status === 'APROVADO' ? 'aprovado' : 'rejeitado'} com sucesso.`,
      certificado: cert
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao validar certificado.', error: err.message });
  }
}

/* ─── Atualizar metadados ─────────────────────────── */
async function atualizar(req, res) {
  try {
    const { titulo, horas, grupo, codigoAtividade, descricaoAtividade, arquivoUrl, semestre } = req.body;

    const cert = await Certificado.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certificado não encontrado.' });

    if (cert.status !== 'PENDENTE') {
      return res.status(400).json({ message: 'Só é possível editar certificados pendentes.' });
    }

    cert.titulo             = titulo             ?? cert.titulo;
    cert.horas              = horas              ?? cert.horas;
    cert.grupo              = grupo              ?? cert.grupo;
    cert.codigoAtividade    = codigoAtividade    ?? cert.codigoAtividade;
    cert.descricaoAtividade = descricaoAtividade ?? cert.descricaoAtividade;
    cert.arquivoUrl         = arquivoUrl         ?? cert.arquivoUrl;
    cert.semestre           = semestre           ?? cert.semestre;

    await cert.save();
    return res.status(200).json({ message: 'Certificado atualizado.', certificado: cert });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao atualizar certificado.', error: err.message });
  }
}

/* ─── Remover ─────────────────────────────────────── */
async function remover(req, res) {
  try {
    const cert = await Certificado.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certificado não encontrado.' });
    return res.status(200).json({ message: 'Certificado removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao remover certificado.', error: err.message });
  }
}

module.exports = {
  listar,
  listarPorAluno,
  listarPorCurso,
  listarPorStatus,
  buscarPorId,
  submeter,
  validar,
  atualizar,
  remover
};
