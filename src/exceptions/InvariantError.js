const ClientError = require('./ClientError');

class InvariantError extends ClientError {
  constructor(message) {
    super(message, 400);
    this.name = 'InvariantError';

    console.log('InvariantError inherits from ClientError?', this instanceof ClientError);
  }
}

module.exports = InvariantError;
