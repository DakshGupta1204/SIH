const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Usage: router.get('/route', auth(['lab','processor']), handler)
// roles array optional. Returns proper Express middleware (not a Promise) to avoid Route.get() error.
const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization || '';
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }
      const token = authHeader.substring(7);
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT secret not configured' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id || decoded._id).lean();
      if (!user) return res.status(401).json({ message: 'User not found' });
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: role not allowed' });
      }
      req.user = user; // attach user
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized', error: err.message });
    }
  };
};

// Separate authorize middleware to keep backward compatibility (authorize('farmer'))
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden: role not allowed' });
  next();
};

module.exports = { auth, authorize };
