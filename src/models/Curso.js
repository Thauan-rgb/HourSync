const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true
    },
    horasExigidas: {
      type: Number,
      required: true,
      min: 1
    },
    horasPorSemestre: {
      type: Number,
      default: 25
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Curso', cursoSchema);
