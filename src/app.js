const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

/* Services */
const AlbumsService = require('./services/albumsService');
const SongsService = require('./services/songsService');
const UsersService = require('./services/usersService');
const AuthenticationsService = require('./services/authenticationsService');
const PlaylistsService = require('./services/PlaylistsService');
const PlaylistSongsService = require('./services/PlaylistSongsService');
const CollaborationsService = require('./services/CollaborationsService');
const PlaylistActivitiesService = require('./services/PlaylistActivitiesService');
const ActivitiesService = require('./services/ActivitiesService');

/* Handlers & Validators */
const AlbumsHandler = require('./api/albums/handlerAlbums');
const SongsHandler = require('./api/songs/handlerSongs');
const AlbumsValidator = require('./api/albums/validatorAlbums');
const SongsValidator = require('./api/songs/validatorSongs');
const UsersValidator = require('./api/users/validatorUsers');
const AuthenticationsValidator = require('./api/authentications/validatorAuthentications');
const PlaylistsValidator = require('./api/playlists/validatorPlaylists');

/* Token Manager */
const TokenManager = require('./tokenize/TokenManager');

/* Plugins */
const users = require('./api/users');
const authentications = require('./api/authentications');
const playlists = require('./api/playlists');
const collaborations = require('./api/collaborations');

/* Routes non-plugin */
const albumsRoutes = require('./api/albums/routesAlbums');
const songsRoutes = require('./api/songs/routeSongs');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService(albumsService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistSongsService = new PlaylistSongsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistActivitiesService = new PlaylistActivitiesService();
  const activitiesService = new ActivitiesService();

  const albumsHandler = new AlbumsHandler(albumsService, AlbumsValidator);
  const songsHandler = new SongsHandler(songsService, SongsValidator);

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: { origin: ['*'] },
      payload: { parse: true, output: 'data' },
    },
  });

  await server.register([Jwt]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: Number(process.env.ACCESS_TOKEN_AGE),
    },
    validate: (artifacts) => {
      const now = Math.floor(Date.now() / 1000);
      const { iat, exp } = artifacts.decoded.payload;

      console.log('[JWT DEBUG] Server now:', now, new Date(now * 1000));
      console.log('[JWT DEBUG] Token iat:', iat, new Date(iat * 1000));
      console.log('[JWT DEBUG] Token exp:', exp, new Date(exp * 1000));

      return {
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
        },
      };
    },
  });

  server.route(albumsRoutes(albumsHandler));
  server.route(songsRoutes(songsHandler));

  await server.register([
    {
      plugin: users,
      options: {
        usersService,
        usersValidator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        authenticationsValidator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        playlistsValidator: PlaylistsValidator,
        playlistSongsService,
        collaborationsService,
        playlistActivitiesService,
        activitiesService,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: PlaylistsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      console.error('[onPreResponse] ERROR TYPE:', response.name);
      console.error('[onPreResponse] MESSAGE:', response.message);
      console.error('[onPreResponse] STATUS CODE:', response.statusCode);
    }

    if (response.isBoom && response.message === 'Invalid token signature') {
      return h.response({ status: 'fail', message: 'Token tidak valid' }).code(401);
    }

    if (response.isBoom && response.message === 'Token expired') {
      return h.response({ status: 'fail', message: 'Token telah kedaluwarsa' }).code(401);
    }

    if (response.isBoom && response.message === 'Missing authentication') {
      return h.response({ status: 'fail', message: 'Autentikasi diperlukan' }).code(401);
    }

    if (response.isBoom && response.message === 'Bad HTTP authentication header format') {
      return h.response({ status: 'fail', message: 'Format header autentikasi salah' }).code(400);
    }

    if (response.name === 'InvariantError') {
      return h.response({ status: 'fail', message: response.message }).code(400);
    }

    if (response instanceof ClientError) {
      return h.response({ status: 'fail', message: response.message }).code(response.statusCode);
    }

    if (response.isBoom) {
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
    }

    return h.continue;
  });

  return server;
};

module.exports = init;
