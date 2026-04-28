/**
 * Seed inicial do HourSync
 * Executa com: node src/seed.js
 *
 * Cria: admin padrão + cursos + categorias do Manual Senac PE 2022
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Usuario  = require('./models/Usuario');
const Curso    = require('./models/Curso');
const Categoria = require('./models/Categoria');

const CATEGORIAS_MANUAL = [
  {
    nome: 'Atividades de Ensino',
    descricao: 'Atividades vinculadas ao ensino',
    cor: '#4f46e5',
    subcategorias: [
      { codigo: '1.1', descricao: 'Participação em monitoria no curso', limiteHoras: 20, unidade: 'por semestre' },
      { codigo: '1.2', descricao: 'Comparecimento a defesas de monografias', limiteHoras: 2, unidade: 'por participação' },
      { codigo: '1.3', descricao: 'Disciplina cursada em outros cursos da Faculdade Senac', limiteHoras: 20, unidade: 'por disciplina' },
      { codigo: '1.4', descricao: 'Disciplinas cursadas fora da Faculdade Senac', limiteHoras: 20, unidade: 'por disciplina' },
      { codigo: '1.5', descricao: 'Cursos instrumentais – informática e/ou Língua Estrangeira', limiteHoras: 10, unidade: 'por semestre' },
      { codigo: '1.6', descricao: 'Certificações Reconhecidas da área', limiteHoras: 10, unidade: 'por semestre' },
      { codigo: '1.7', descricao: 'Elaboração de material didático com supervisão do professor', limiteHoras: 5, unidade: 'por material' },
      { codigo: '1.8', descricao: 'Atividade extraclasse promovida como parte da formação do aluno', limiteHoras: 10, unidade: 'por participação' },
      { codigo: '1.9', descricao: 'Visitas técnicas', limiteHoras: 4, unidade: 'por visita' }
    ]
  },
  {
    nome: 'Atividades de Pesquisa',
    descricao: 'Atividades vinculadas à pesquisa',
    cor: '#0891b2',
    subcategorias: [
      { codigo: '2.1', descricao: 'Participação em pesquisas ou atividades de pesquisa', limiteHoras: 10, unidade: 'por produto final publicado' },
      { codigo: '2.2', descricao: 'Programas de bolsa de Iniciação Científica', limiteHoras: 20, unidade: 'por bolsa' },
      { codigo: '2.3', descricao: 'Publicações de artigos em revistas, periódicos e congêneres', limiteHoras: 10, unidade: 'por produto publicado' },
      { codigo: '2.4', descricao: 'Publicação em livro na área', limiteHoras: 40, unidade: 'por produto publicado' },
      { codigo: '2.5', descricao: 'Participação em programa especial de treinamento', limiteHoras: 10, unidade: 'por semestre' }
    ]
  },
  {
    nome: 'Atividades de Extensão',
    descricao: 'Atividades vinculadas à extensão',
    cor: '#059669',
    subcategorias: [
      { codigo: '3.1', descricao: 'Participação em seminários, congressos, conferências, encontros', limiteHoras: 10, unidade: 'por participação' },
      { codigo: '3.2', descricao: 'Atendimento comunitário de cunho social', limiteHoras: 10, unidade: 'por semestre' },
      { codigo: '3.3', descricao: 'Apresentação de trabalhos, concursos, exposições, mostras', limiteHoras: 10, unidade: 'pela apresentação' },
      { codigo: '3.4', descricao: 'Estágio extracurricular em entidades públicas ou privadas conveniadas', limiteHoras: 20, unidade: 'por semestre' },
      { codigo: '3.5', descricao: 'Participação em órgãos colegiados da Faculdade Senac', limiteHoras: 5, unidade: 'por semestre' },
      { codigo: '3.6', descricao: 'Representação estudantil', limiteHoras: 10, unidade: 'por semestre' },
      { codigo: '3.7', descricao: 'Cursos de extensão universitária, dentro ou fora da Faculdade Senac', limiteHoras: 10, unidade: 'por curso' }
    ]
  }
];

const CURSOS = [
  { nome: 'Análise e Desenvolvimento de Sistemas', horasExigidas: 100, horasPorSemestre: 25 },
  { nome: 'Jogos Digitais',                        horasExigidas: 100, horasPorSemestre: 25 },
  { nome: 'Internet das Coisas',                   horasExigidas: 100, horasPorSemestre: 25 },
  { nome: 'Gastronomia',                           horasExigidas: 200, horasPorSemestre: 25 }
];

async function seed() {
  await connectDB();
  console.log('🌱 Iniciando seed...');

  // Admin
  const adminEmail = 'admin@faculdade.edu.br';
  const existeAdmin = await Usuario.findOne({ email: adminEmail });
  if (!existeAdmin) {
    await Usuario.create({
      nome:  'Super Admin',
      email: adminEmail,
      senha: 'admin123',
      role:  'SUPER_ADMIN',
      ativo: true
    });
    console.log('✅ Admin criado: admin@faculdade.edu.br / admin123');
  } else {
    console.log('ℹ️  Admin já existe, pulando.');
  }

  // Cursos
  for (const c of CURSOS) {
    const existe = await Curso.findOne({ nome: c.nome });
    if (!existe) {
      await Curso.create(c);
      console.log(`✅ Curso: ${c.nome}`);
    }
  }

  // Categorias globais do Manual
  for (const cat of CATEGORIAS_MANUAL) {
    const existe = await Categoria.findOne({ nome: cat.nome, cursoId: null });
    if (!existe) {
      await Categoria.create({ ...cat, cursoId: null });
      console.log(`✅ Categoria: ${cat.nome}`);
    }
  }

  console.log('\n🎉 Seed concluído!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
