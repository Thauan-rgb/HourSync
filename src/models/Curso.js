const mongoose = require("mongoose");

const subcategoriaSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true },
    descricao: { type: String, required: true },
    limiteHoras: { type: Number, default: 10 },
    unidade: { type: String, default: "por semestre" },
  },
  { _id: false }
);

const categoriaSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String },
    cor: { type: String, default: "#6c83e6" },
    subcategorias: [subcategoriaSchema],
  },
  { _id: false }
);

const cursoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "Nome do curso é obrigatório"],
      trim: true,
    },
    codigo: {
      type: String,
      required: [true, "Código do curso é obrigatório"],
      unique: true,
      trim: true,
    },
    duracao: {
      type: Number, // semestres
      default: 4,
    },
    totalHorasExigidas: {
      type: Number,
      default: 100,
    },
    limiteSemestral: {
      type: Number,
      default: 25,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    // Categorias e limites personalizados por curso
    categorias: [categoriaSchema],
    // Grupos aceitos (nomes das categorias)
    gruposAceitos: {
      type: [String],
      default: [
        "Atividades de Ensino",
        "Atividades de Pesquisa",
        "Atividades de Extensão",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Curso", cursoSchema);
