const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    senha: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    cpf: {
      type: String,
      trim: true,
      default: null
    },
    matricula: {
      type: String,
      trim: true,
      default: null
    },
    celular: {
      type: String,
      trim: true,
      default: null
    },
    faculdade: {
      type: String,
      trim: true,
      default: 'Faculdade Senac PE'
    },
    foto: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'COORDENADOR', 'ALUNO'],
      default: 'ALUNO'
    },
    ativo: {
      type: Boolean,
      default: true
    },
    // Curso vinculado (para ALUNO e COORDENADOR)
    cursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso',
      default: null
    },
    // Múltiplos cursos para coordenador
    cursosIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso'
    }]
  },
  { timestamps: true }
);

/* ── Hash de senha antes de salvar ──────────────── */
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

usuarioSchema.methods.compararSenha = function (senhaPlana) {
  return bcrypt.compare(senhaPlana, this.senha);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
