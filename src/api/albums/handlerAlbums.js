class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);

      const { name, year } = request.payload;
      const albumId = await this._service.addAlbum({ name, year });

      return h.response({
        status: 'success',
        data: { albumId },
      }).code(201);
    } catch (error) {
      console.error('Error in postAlbumHandler:', error);
      throw error; // biarkan onPreResponse yang menangani
    }
  }

  async getAlbumsHandler() {
    try {
      const albums = await this._service.getAlbums();
      return {
        status: 'success',
        data: { albums },
      };
    } catch (error) {
      console.error('Error in getAlbumsHandler:', error);
      throw error;
    }
  }

  async getAlbumByIdHandler(request) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);
      return {
        status: 'success',
        data: { album },
      };
    } catch (error) {
      console.error('Error in getAlbumByIdHandler:', error);
      throw error;
    }
  }

  async putAlbumByIdHandler(request) {
    try {
      this._validator.validateAlbumPayload(request.payload);

      const { id } = request.params;
      const { name, year } = request.payload;
      await this._service.editAlbumById(id, { name, year });

      return {
        status: 'success',
        message: 'Album berhasil diperbarui',
      };
    } catch (error) {
      console.error('Error in putAlbumByIdHandler:', error);
      throw error;
    }
  }

  async deleteAlbumByIdHandler(request) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Album berhasil dihapus',
      };
    } catch (error) {
      console.error('Error in deleteAlbumByIdHandler:', error);
      throw error;
    }
  }
}

module.exports = AlbumsHandler;
