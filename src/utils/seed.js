/**
 * HourSync — Seed Script
 * Popula o banco com dados iniciais: cursos + usuário admin padrão
 *
 * Como usar:
 *   node src/utils/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
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
      { codigo: "3.1", descricao: "Participação em seminários, congressos, conferências, encontros", limiteHoras: 10, unidade: "por participação" },
      { codigo: "3.2", descricao: "Atendimento comunitário de cunho social", limiteHoras: 10, unidade: "por semestre" },
      { codigo: "3.3", descricao: "Apresentação de trabalhos, concursos, exposições, mostras", limiteHoras: 10, unidade: "pela apresentação" },
      { codigo: "3.4", descricao: "Estágio extracurricular em entidades públicas ou privadas conveniadas", limiteHoras: 20, unidade: "por semestre" },
      { codigo: "3.5", descricao: "Participação em órgãos colegiados da Faculdade Senac", limiteHoras: 5, unidade: "por semestre" },
      { codigo: "3.6", descricao: "Representação estudantil", limiteHoras: 10, unidade: "por semestre" },
      { codigo: "3.7", descricao: "Cursos de extensão universitária, dentro ou fora da Faculdade Senac", limiteHoras: 10, unidade: "por curso" },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");

  // Limpa coleções
  await Curso.deleteMany({});
  await Usuario.deleteMany({});
  console.log("🧹 Coleções limpas");

  // Cria cursos
  const cursos = await Curso.insertMany([
    { nome: "Análise e Desenvolvimento de Sistemas", codigo: "ADS-01", duracao: 4, totalHorasExigidas: 100, limiteSemestral: 25, categorias: CATEGORIAS_PADRAO, gruposAceitos: CATEGORIAS_PADRAO.map(c => c.nome) },
    { nome: "Jogos Digitais", codigo: "JD-02", duracao: 4, totalHorasExigidas: 100, limiteSemestral: 25, categorias: CATEGORIAS_PADRAO, gruposAceitos: CATEGORIAS_PADRAO.map(c => c.nome) },
    { nome: "Internet das Coisas", codigo: "IOT-03", duracao: 3, totalHorasExigidas: 100, limiteSemestral: 20, categorias: CATEGORIAS_PADRAO, gruposAceitos: CATEGORIAS_PADRAO.map(c => c.nome) },
    { nome: "Gastronomia", codigo: "GAST-04", duracao: 4, totalHorasExigidas: 100, limiteSemestral: 20, categorias: CATEGORIAS_PADRAO, gruposAceitos: CATEGORIAS_PADRAO.map(c => c.nome) },
  ]);
  console.log(`📚 ${cursos.length} cursos criados`);

  const [ads, jd, iot, gast] = cursos;

  // Cria admin
  await Usuario.create({
    nome: "Super Administrador",
    email: "admin@faculdade.edu.br",
    senha: "admin123",
    role: "SUPER_ADMIN",
    faculdade: "Faculdade Senac PE",
  });

  // Cria coordenadores
  const coord1 = await Usuario.create({
    nome: "Amelara Silva",
    email: "amelara@gmail.com",
    senha: "coord123",
    role: "COORDENADOR",
    cursos: [ads._id, jd._id],
    faculdade: "Faculdade Senac PE",
  });

  const coord2 = await Usuario.create({
    nome: "Carlos Mendes",
    email: "carlos.mendes@faculdade.edu.br",
    senha: "coord123",
    role: "COORDENADOR",
    cursos: [iot._id],
    faculdade: "Faculdade Senac PE",
  });

  // Cria alunos de exemplo
  await Usuario.create([
    { nome: "João Silva",       email: "joao.silva@faculdade.edu.br",    senha: "aluno123", role: "ALUNO", matricula: "20240001", curso: ads._id, turma: "TADS047" },
    { nome: "Ana Maria",        email: "ana.souza@faculdade.edu.br",      senha: "aluno123", role: "ALUNO", matricula: "20240002", curso: gast._id, turma: "GAS022" },
    { nome: "Julia Barboza",    email: "julia.lima@faculdade.edu.br",     senha: "aluno123", role: "ALUNO", matricula: "20240003", curso: jd._id, turma: "JD011" },
    { nome: "Marcos Vinicius",  email: "marcos.rocha@faculdade.edu.br",   senha: "aluno123", role: "ALUNO", matricula: "20240004", curso: ads._id, turma: "TADS047" },
    { nome: "Camila Fernandes", email: "camila.alves@faculdade.edu.br",   senha: "aluno123", role: "ALUNO", matricula: "20240005", curso: iot._id, turma: "IOT001" },
  ]);
  console.log("👤 Usuários criados");

  console.log("\n🎉 Seed concluído com sucesso!\n");
  console.log("Logins de acesso:");
  console.log("  Admin:       admin@faculdade.edu.br  / admin123");
  console.log("  Coord 1:     amelara@gmail.com        / coord123");
  console.log("  Coord 2:     carlos.mendes@...        / coord123");
  console.log("  Aluno:       joao.silva@...           / aluno123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
