const Categoria = require('../models/Categoria');

async function listar(_req, res) {
  try {
    const cats = await Categoria.find().populate('cursoId').sort({ nome: 1 });
    return res.status(200).json(cats);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar categorias.', error: err.message });
  }
}

async function listarPorCurso(req, res) {
  try {
    // Retorna categorias do curso específico + categorias globais (cursoId: null)
    const cats = await Categoria.find({
      $or: [{ cursoId: req.params.cursoId }, { cursoId: null }]
    }).sort({ nome: 1 });
    return res.status(200).json(cats);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar categorias.', error: err.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const cat = await Categoria.findById(req.params.id).populate('cursoId');
    if (!cat) return res.status(404).json({ message: 'Categoria não encontrada.' });
    return res.status(200).json(cat);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao buscar categoria.', error: err.message });
  }
}

async function criar(req, res) {
  try {
    const { nome, descricao, cor, cursoId, subcategorias } = req.body;

    if (!nome) return res.status(400).json({ message: 'Nome é obrigatório.' });

    const cat = await Categoria.create({
      nome,
      descricao:     descricao     || null,
      cor:           cor           || '#4f46e5',
      cursoId:       cursoId       || null,
      subcategorias: subcategorias || []
    });

    return res.status(201).json({ message: 'Categoria criada com sucesso.', categoria: cat });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao criar categoria.', error: err.message });
  }
}

async function atualizar(req, res) {
  try {
    const { nome, descricao, cor, cursoId, subcategorias, ativo } = req.body;

    const cat = await Categoria.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Categoria não encontrada.' });

    cat.nome          = nome          ?? cat.nome;
    cat.descricao     = descricao     ?? cat.descricao;
    cat.cor           = cor           ?? cat.cor;
    cat.cursoId       = cursoId       ?? cat.cursoId;
    cat.subcategorias = subcategorias ?? cat.subcategorias;
    cat.ativo         = ativo         ?? cat.ativo;

    await cat.save();
    return res.status(200).json({ message: 'Categoria atualizada.', categoria: cat });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao atualizar categoria.', error: err.message });
  }
}

async function remover(req, res) {
  try {
    const cat = await Categoria.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Categoria não encontrada.' });
    return res.status(200).json({ message: 'Categoria removida com sucesso.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao remover categoria.', error: err.message });
  }
}

module.exports = { listar, listarPorCurso, buscarPorId, criar, atualizar, remover };
