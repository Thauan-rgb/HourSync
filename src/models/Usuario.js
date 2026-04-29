const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    senha: {
      type: String,
      required: [true, "Senha é obrigatória"],
      minlength: 6,
      select: false, // não retorna senha por padrão
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "COORDENADOR", "ALUNO"],
      default: "ALUNO",
    },
    matricula: {
      type: String,
      trim: true,
      sparse: true,
    },
    cpf: {
      type: String,
      trim: true,
      sparse: true,
    },
    celular: {
      type: String,
      trim: true,
    },
    faculdade: {
      type: String,
      default: "Faculdade Senac PE",
    },
    foto: {
      type: String,
      default: "",
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    // Coordenador: cursos vinculados
    cursos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Curso",
      },
    ],
    // Aluno: curso vinculado
    curso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Curso",
      default: null,
    },
    turma: {
      type: String,
      trim: true,
    },
    // Horas acumuladas por semestre (aluno)
    horasSemestre: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash da senha antes de salvar
usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("senha")) return next();
  this.senha = await bcrypt.hash(this.senha, 12);
  next();
});

// Método para comparar senha
usuarioSchema.methods.compararSenha = async function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

module.exports = mongoose.model("Usuario", usuarioSchema);
