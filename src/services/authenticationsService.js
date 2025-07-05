const InvariantError = require('../exceptions/InvariantError');

class AuthenticationsService {
  constructor() {
    this._refreshTokens = new Set();
  }

  addToken(token) {
    this._refreshTokens.add(token);
  }

  verifyRefreshToken(token) {
    if (!this._refreshTokens.has(token)) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  deleteToken(token) {
    if (!this._refreshTokens.has(token)) {
      throw new InvariantError('Refresh token tidak ditemukan');
    }

    this._refreshTokens.delete(token);
  }
}

module.exports = AuthenticationsService;
