import config from '../../common/config/envConfig.js';
import jwt from 'jsonwebtoken'
import crypto from 'crypto';

/**
 * @method Function
 * @description Use to generate bearer jwt token
 */

export const generateToken = (user) => {
    return jwt.sign
    ({ id: user.id, role: user.role ?? null}, 
      config.JWT_SECRET, 
      { expiresIn: "7d" });
  };
  

/**
 * @method Function
 * @description Use to generate OTP
 */

export const generateOTP = () =>{
    // return Math.floor(100000 + Math.random() * 900000)
    return "1234"
}

/**
 * @method Function
 * @description Use to generate auth token
 */

export const generateAuthToken = () =>{
    const length = 32; // ✅ define token length here
    const token = crypto.randomBytes(length)
        .toString("base64")  
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, length);
        
        return token;
}

