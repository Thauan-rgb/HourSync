const jwt = require('jsonwebtoken');

function gerarToken(usuario) {
  return jwt.sign(
    {
      id:    usuario._id,
      email: usuario.email,
      role:  usuario.role,
      nome:  usuario.nome
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { gerarToken };
