const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// Verifica se o token JWT é válido
const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Não autorizado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select("-senha");

    if (!usuario) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    if (!usuario.ativo) {
      return res.status(401).json({ message: "Conta inativa." });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
};

module.exports = authMiddleware;
