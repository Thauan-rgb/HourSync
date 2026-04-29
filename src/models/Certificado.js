const mongoose = require("mongoose");

const certificadoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "Título é obrigatório"],
      trim: true,
    },
    aluno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    curso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Curso",
      required: true,
    },
    turma: {
      type: String,
      trim: true,
    },
    // Grupo = categoria principal (ex: "Atividades de Ensino")
    grupo: {
      type: String,
      required: [true, "Grupo/Categoria é obrigatório"],
    },
    // Código da subcategoria (ex: "1.8")
    codigoAtividade: {
      type: String,
      required: [true, "Código da atividade é obrigatório"],
    },
    descricaoAtividade: {
      type: String,
      required: [true, "Descrição da atividade é obrigatória"],
    },
    horasSolicitadas: {
      type: Number,
      required: [true, "Horas solicitadas são obrigatórias"],
      min: 1,
    },
    horasAprovadas: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pendente", "Aprovado", "Rejeitado"],
      default: "Pendente",
    },
    // URL do arquivo (PDF/imagem) enviado pelo aluno
    arquivoUrl: {
      type: String,
      default: "",
    },
    // Coordenador que validou
    coordenadorValidador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },
    motivoRejeicao: {
      type: String,
      default: "",
    },
    dataValidacao: {
      type: Date,
      default: null,
    },
    semestre: {
      type: String, // ex: "2026.1"
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificado", certificadoSchema);
