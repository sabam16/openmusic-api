const PlaylistsHandler = require('./PlaylistsHandler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (
    server,
    { playlistsService, playlistsValidator, playlistSongsService, collaborationsService, 
    playlistActivitiesService }
  ) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      playlistsValidator,
      playlistSongsService, 
      collaborationsService,
      playlistActivitiesService 
    );

    server.route(routes(playlistsHandler));
  },
};
