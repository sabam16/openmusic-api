const Jwt = require('@hapi/jwt');
const jsonwebtoken = require('jsonwebtoken');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  // 🔁 Generate Access Token (dengan log iat & exp untuk debugging)
  generateAccessToken: (payload) => {
    const token = Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY, {
      ttlSec: parseInt(process.env.ACCESS_TOKEN_AGE, 10) || 86400, // fallback 24 jam
    });

    const decoded = Jwt.token.decode(token);
    console.log('Access Token:', token);
    console.log('iat:', decoded.decoded.payload.iat, new Date(decoded.decoded.payload.iat * 1000));
    console.log('exp:', decoded.decoded.payload.exp, new Date(decoded.decoded.payload.exp * 1000));

    return token;
  },

  // 🔁 Generate Refresh Token (pakai jsonwebtoken karena tidak expired)
  generateRefreshToken: (payload) =>
    jsonwebtoken.sign(payload, process.env.REFRESH_TOKEN_KEY),

  // 🔍 Verify Refresh Token
  verifyRefreshToken: (token) => {
    try {
      const decoded = jsonwebtoken.verify(token, process.env.REFRESH_TOKEN_KEY);
      return decoded;
    } catch (e) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
