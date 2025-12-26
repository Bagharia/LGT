const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT
const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Accès non autorisé - Token manquant' 
      });
    }

    // Extraire le token (format: "Bearer TOKEN")
    const token = authHeader.split(' ')[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter les infos de l'utilisateur à la requête
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    // Passer au middleware suivant
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token invalide' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expiré - Veuillez vous reconnecter' 
      });
    }

    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({ 
      error: 'Erreur d\'authentification' 
    });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Accès refusé - Droits administrateur requis' 
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };