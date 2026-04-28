const Curso = require('../models/Curso');

async function listar(_req, res) {
  try {
    const cursos = await Curso.find().sort({ nome: 1 });
    return res.status(200).json(cursos);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar cursos.', error: err.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) return res.status(404).json({ message: 'Curso não encontrado.' });
    return res.status(200).json(curso);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao buscar curso.', error: err.message });
  }
}

async function criar(req, res) {
  try {
    const { nome, horasExigidas, horasPorSemestre } = req.body;

    if (!nome || !horasExigidas) {
      return res.status(400).json({ message: 'Nome e horasExigidas são obrigatórios.' });
    }

    const curso = await Curso.create({ nome, horasExigidas, horasPorSemestre: horasPorSemestre || 25 });
    return res.status(201).json({ message: 'Curso criado com sucesso.', curso });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao criar curso.', error: err.message });
  }
}

async function atualizar(req, res) {
  try {
    const { nome, horasExigidas, horasPorSemestre, ativo } = req.body;

    const curso = await Curso.findById(req.params.id);
    if (!curso) return res.status(404).json({ message: 'Curso não encontrado.' });

    curso.nome             = nome             ?? curso.nome;
    curso.horasExigidas    = horasExigidas    ?? curso.horasExigidas;
    curso.horasPorSemestre = horasPorSemestre ?? curso.horasPorSemestre;
    curso.ativo            = ativo            ?? curso.ativo;

    await curso.save();
    return res.status(200).json({ message: 'Curso atualizado com sucesso.', curso });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao atualizar curso.', error: err.message });
  }
}

async function remover(req, res) {
  try {
    const curso = await Curso.findByIdAndDelete(req.params.id);
    if (!curso) return res.status(404).json({ message: 'Curso não encontrado.' });
    return res.status(200).json({ message: 'Curso removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao remover curso.', error: err.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
