const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345';

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
    }
    req.user = user; // { id, email, username }
    next();
  });
};

module.exports = authenticateToken;
