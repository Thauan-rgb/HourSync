const Curso = require("../models/Curso");

const CATEGORIAS_PADRAO = [
  {
    nome: "Atividades de Ensino",
    descricao: "Atividades vinculadas ao ensino",
    cor: "#4f46e5",
    subcategorias: [
      { codigo: "1.1", descricao: "Participação em monitoria no curso", limiteHoras: 20, unidade: "por semestre" },
      { codigo: "1.2", descricao: "Comparecimento a defesas de monografias – temas pertinentes", limiteHoras: 2, unidade: "por participação" },
      { codigo: "1.3", descricao: "Disciplina cursada em outros cursos da Faculdade Senac", limiteHoras: 20, unidade: "por disciplina" },
      { codigo: "1.4", descricao: "Disciplinas cursadas fora da Faculdade Senac", limiteHoras: 20, unidade: "por disciplina" },
      { codigo: "1.5", descricao: "Cursos instrumentais – informática e/ou Língua Estrangeira", limiteHoras: 10, unidade: "por semestre" },
      { codigo: "1.6", descricao: "Certificações Reconhecidas da área", limiteHoras: 10, unidade: "por semestre" },
      { codigo: "1.7", descricao: "Elaboração de material didático com supervisão do professor", limiteHoras: 5, unidade: "por material" },
      { codigo: "1.8", descricao: "Atividade extraclasse promovida como parte da formação do aluno", limiteHoras: 10, unidade: "por participação" },
      { codigo: "1.9", descricao: "Visitas técnicas", limiteHoras: 4, unidade: "por visita" },
    ],
  },
  {
    nome: "Atividades de Pesquisa",
    descricao: "Atividades vinculadas à pesquisa",
    cor: "#0891b2",
    subcategorias: [
      { codigo: "2.1", descricao: "Participação em pesquisas ou atividades de pesquisa", limiteHoras: 10, unidade: "por produto final publicado" },
      { codigo: "2.2", descricao: "Programas de bolsa de Iniciação Científica", limiteHoras: 20, unidade: "por bolsa" },
      { codigo: "2.3", descricao: "Publicações de artigos em revistas, periódicos e congêneres", limiteHoras: 10, unidade: "por produto publicado" },
      { codigo: "2.4", descricao: "Publicação em livro na área", limiteHoras: 40, unidade: "por produto publicado" },
      { codigo: "2.5", descricao: "Participação em programa especial de treinamento", limiteHoras: 10, unidade: "por semestre" },
    ],
  },
  {
    nome: "Atividades de Extensão",
    descricao: "Atividades vinculadas à extensão",
    cor: "#059669",
    subcategorias: [
      { codigo: "3.1", descricao: "Participação em seminários, congressos, conferências, encontros", limiteHoras: 10, unidade: "por participação (4h como público)" },
      { codigo: "3.2", descricao: "Atendimento comunitário de cunho social", limiteHoras: 10, unidade: "por semestre" },
      { codigo: "3.3", descricao: "Apresentação de trabalhos, concursos, exposições, mostras", limiteHoras: 10, unidade: "pela apresentação" },
      { codigo: "3.4", descricao: "Estágio extracurricular em entidades públicas ou privadas conveniadas", limiteHoras: 20, unidade: "por semestre" },
      { codigo: "3.5", descricao: "Participação em órgãos colegiados da Faculdade Senac", limiteHoras: 5, unidade: "por semestre" },
      { codigo: "3.6", descricao: "Representação estudantil", limiteHoras: 10, unidade: "por semestre" },
      { codigo: "3.7", descricao: "Cursos de extensão universitária, dentro ou fora da Faculdade Senac", limiteHoras: 10, unidade: "por curso" },
    ],
  },
];

// GET /cursos
const listar = async (req, res) => {
  try {
    const cursos = await Curso.find().sort({ nome: 1 });
    res.json(cursos);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar cursos." });
  }
};

// GET /cursos/:id
const buscarPorId = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) return res.status(404).json({ message: "Curso não encontrado." });
    res.json(curso);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar curso." });
  }
};

// POST /cursos
// Body: { nome, codigo, duracao, totalHorasExigidas, limiteSemestral }
const criar = async (req, res) => {
  try {
    const { nome, codigo, duracao, totalHorasExigidas, limiteSemestral } = req.body;

    const curso = await Curso.create({
      nome,
      codigo,
      duracao: duracao || 4,
      totalHorasExigidas: totalHorasExigidas || 100,
      limiteSemestral: limiteSemestral || 25,
      categorias: CATEGORIAS_PADRAO,
      gruposAceitos: CATEGORIAS_PADRAO.map((c) => c.nome),
    });

    res.status(201).json(curso);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Código do curso já cadastrado." });
    }
    console.error(err);
    res.status(500).json({ message: "Erro ao criar curso." });
  }
};

// PUT /cursos/:id
const atualizar = async (req, res) => {
  try {
    const { nome, duracao, totalHorasExigidas, limiteSemestral, categorias, gruposAceitos, ativo } =
      req.body;

    const curso = await Curso.findById(req.params.id);
    if (!curso) return res.status(404).json({ message: "Curso não encontrado." });

    if (nome !== undefined) curso.nome = nome;
    if (duracao !== undefined) curso.duracao = duracao;
    if (totalHorasExigidas !== undefined) curso.totalHorasExigidas = totalHorasExigidas;
    if (limiteSemestral !== undefined) curso.limiteSemestral = limiteSemestral;
    if (categorias !== undefined) curso.categorias = categorias;
    if (gruposAceitos !== undefined) curso.gruposAceitos = gruposAceitos;
    if (ativo !== undefined) curso.ativo = ativo;

    await curso.save();
    res.json(curso);
  } catch (err) {
    res.status(500).json({ message: "Erro ao atualizar curso." });
  }
};

// DELETE /cursos/:id
const remover = async (req, res) => {
  try {
    const curso = await Curso.findByIdAndDelete(req.params.id);
    if (!curso) return res.status(404).json({ message: "Curso não encontrado." });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Erro ao remover curso." });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
