const Hapi = require('@hapi/hapi');
const AlbumsService = require('./services/albumsService');
const SongsService = require('./services/songsService');
const AlbumsHandler = require('./api/albums/handlerAlbums');
const SongsHandler = require('./api/songs/handlerSongs');
const albumsRoutes = require('./api/albums/routesAlbums');
const songsRoutes = require('./api/songs/routeSongs');
const AlbumsValidator = require('./api/albums/validatorAlbums');
const SongsValidator = require('./api/songs/validatorSongs');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService(albumsService);

  const albumsHandler = new AlbumsHandler(albumsService, AlbumsValidator);
  const songsHandler = new SongsHandler(songsService, SongsValidator);

  const server = Hapi.server({
    port: process.env.PORT || 9000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
      payload: {
        parse: true,
        output: 'data',
      },
    },
  });

  server.route(albumsRoutes(albumsHandler));
  server.route(songsRoutes(songsHandler));

  // Middleware error handling
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      console.error('[onPreResponse] ERROR TYPE:', response.name);
      console.error('[onPreResponse] MESSAGE:', response.message);
      console.error('[onPreResponse] STATUS CODE:', response.statusCode);
    }

    // Tambahan untuk tangani InvariantError secara eksplisit
    if (response.name === 'InvariantError') {
      console.log('[onPreResponse] handled as InvariantError');
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(400);
      return newResponse;
    }

    if (response instanceof ClientError) {
      console.log('[onPreResponse] handled as ClientError');
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response.isBoom) {
      console.log('[onPreResponse] handled as Boom');
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  return server;
};

module.exports = init;
