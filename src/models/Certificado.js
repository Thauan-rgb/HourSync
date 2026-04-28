const mongoose = require('mongoose');

const certificadoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    horas: {
      type: Number,
      required: true,
      min: 0.5
    },
    horasAprovadas: {
      type: Number,
      default: null   // preenchido quando validado
    },
    grupo: {
      type: String,
      default: null   // ex: "Atividades de Ensino"
    },
    codigoAtividade: {
      type: String,
      default: null   // ex: "1.1"
    },
    descricaoAtividade: {
      type: String,
      default: null
    },
    arquivoUrl: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['PENDENTE', 'APROVADO', 'REJEITADO'],
      default: 'PENDENTE'
    },
    motivoRejeicao: {
      type: String,
      default: null
    },
    semestre: {
      type: String,
      default: null   // ex: "2024.1"
    },

    // Relacionamentos
    aluno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      default: null
    },
    curso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso',
      required: true
    },
    coordenador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null   // preenchido quando validado
    },
    dataValidacao: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificado', certificadoSchema);
