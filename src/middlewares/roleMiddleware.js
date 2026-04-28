/**
 * Gera um middleware que verifica se o usuário logado possui uma das roles permitidas.
 * Uso: roleMiddleware('SUPER_ADMIN') ou roleMiddleware('SUPER_ADMIN', 'COORDENADOR')
 */
function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'Não autenticado.' });
    }
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
    }
    next();
  };
}

module.exports = roleMiddleware;
