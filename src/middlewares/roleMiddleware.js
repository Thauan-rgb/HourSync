// Retorna middleware que verifica se o usuário tem uma das roles permitidas
const roleMiddleware = (...rolesPermitidas) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: "Não autenticado." });
    }

    if (!rolesPermitidas.includes(req.usuario.role)) {
      return res.status(403).json({
        message: `Acesso negado. Requer: ${rolesPermitidas.join(" ou ")}.`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
