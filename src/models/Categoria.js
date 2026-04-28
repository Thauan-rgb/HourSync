const mongoose = require('mongoose');

const subcategoriaSchema = new mongoose.Schema({
  codigo:      { type: String, required: true },
  descricao:   { type: String, required: true },
  limiteHoras: { type: Number, default: null },
  unidade:     { type: String, default: null }
}, { _id: false });

const categoriaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true
    },
    descricao: {
      type: String,
      default: null
    },
    cor: {
      type: String,
      default: '#4f46e5'
    },
    cursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso',
      default: null   // null = categoria global (todos os cursos)
    },
    subcategorias: [subcategoriaSchema],
    ativo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categoria', categoriaSchema);
