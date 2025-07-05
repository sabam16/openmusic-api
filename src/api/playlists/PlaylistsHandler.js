const autoBind = require('auto-bind');


class PlaylistsHandler {
  constructor(service, validator, playlistSongsService, collaborationsService, activitiesService, playlistActivitiesService) {
    this._service = service;
    this._validator = validator;
    this._playlistSongsService = playlistSongsService;
    this._collaborationsService = collaborationsService;
    this._activitiesService = activitiesService;
    this.__playlistActivitiesService = playlistActivitiesService;
    console.log('[DEBUG] playlistActivitiesService:', !!playlistActivitiesService);
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: owner } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({ name, owner });

      const response = h.response({
        status: 'success',
        data: { playlistId },
      });
      response.code(201);
      return response;
    } catch (error) {
      console.error('Error in postPlaylistHandler:', error);
      throw error;
    }
  }

  async getPlaylistsHandler(request) {
    try {
      const { id: owner } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(owner);

      return {
        status: 'success',
        data: { playlists },
      };
    } catch (error) {
      console.error('Error in getPlaylistsHandler:', error);
      throw error;
    }
  }

  async deletePlaylistHandler(request) {
    try {
      const { id } = request.params;
      const { id: owner } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, owner);
      await this._service.deletePlaylist(id);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      console.error('Error in deletePlaylistHandler:', error);
      throw error;
    }
  }

  async addSongToPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);

      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;

      // Verifikasi akses playlist (owner atau kolaborator)
      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      await this._playlistSongsService.verifySongExists(songId);
      await this._playlistSongsService.addSongToPlaylist(playlistId, songId);

      console.log('[DEBUG] this._playlistActivitiesService:', !!this._playlistActivitiesService);
      // Log activity
      await this._activitiesService.addActivity(
        playlistId,
        songId,
        credentialId,
        'add'
      );

      return h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      }).code(201);
    } catch (error) {
      console.error('Error in addSongToPlaylistHandler:', error);
      throw error;
    }
  }

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      // Verifikasi akses playlist (owner atau kolaborator)
      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      await this._playlistSongsService.deleteSongFromPlaylist(playlistId, songId);

      // Log activity
      await this._activitiesService.addActivity(
        playlistId,
        songId,
        credentialId,
        'delete'
      );

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      };
    } catch (error) {
      console.error('Error in deleteSongFromPlaylistHandler:', error);
      throw error;
    }
  }

  async getSongsFromPlaylistHandler(request) {
    try {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      // Verifikasi akses playlist (owner atau kolaborator)
      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      const playlist = await this._service.getPlaylistById(playlistId);
      const songs = await this._playlistSongsService.getSongsFromPlaylist(playlistId);
      
      return {
        status: 'success',
        data: { playlist: {
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
          songs, },
        },
      };
    } catch (error) {
      console.error('Error in getSongsFromPlaylistHandler:', error);
      throw error;
    }
  }

  async getPlaylistActivitiesHandler(request) {
    try {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      // Verifikasi akses playlist (owner atau kolaborator)
      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      const activities = await this._activitiesService.getActivities(playlistId);

      return {
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      };
    } catch (error) {
      console.error('Error in getPlaylistActivitiesHandler:', error);
      throw error;
    }
  }
}

module.exports = PlaylistsHandler;