import jwt from 'jsonwebtoken';
import config from '../config/envConfig.js';
import models from '../../models/index.js';

export const authenticateToken = async (req, res, next) => {
  let token = req.headers.authorization;
  
  if (!token || !token.startsWith("Bearer")) {
    return res.status(401).json({ status: false, message: 'Authentication failed. No token provided.' });
  }

  token = token.slice(7);
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.decoded = decoded;
    const { id, role } = decoded;
    


    let user;
    
    if (role == 'admin') {
          console.log("TOKEN DECODED:", decoded);

      user = await models.Admin.findByPk(id);
      if (!user) {
        return res.status(403).json({ status: false, message: 'Authentication failed. Admin not authorized.' });
      }
      req.admin = user;
    } else {
      user = await models.User.findByPk(id);
      if (!user) {
        return res.status(403).json({ status: false, message: 'Authentication failed. User not authorized.' });
      }
      req.user = user;
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ status: false, message: 'Authentication failed. Invalid token.' });
  }
};

// Optional authentication middleware - doesn't fail if token is missing
export const optionalAuthenticateToken = async (req, res, next) => {
  let token = req.headers.authorization;
  
  if (!token || !token.startsWith("Bearer")) {
    // No token provided, continue without authentication
    req.user = null;
    return next();
  }

  token = token.slice(7);
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.decoded = decoded;
    const { id, role } = decoded;
    
    let user;
    
    if (role == 'admin') {
      user = await models.Admin.findByPk(id);
      if (user) {
        req.admin = user;
      }
    } else {
      user = await models.User.findByPk(id);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Invalid token, continue without authentication
    req.user = null;
    next();
  }
};