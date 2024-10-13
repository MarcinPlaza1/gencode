const accessControl = (requiredRole) => {
    return (req, res, next) => {
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Brak dostępu do tej operacji.' });
      }
      next();
    };
  };
  
  module.exports = accessControl;
  