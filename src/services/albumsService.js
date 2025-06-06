const { nanoid } = require('nanoid');
const db = require('../models/db');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await db.query(query);
    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await db.query('SELECT id, name FROM albums');
    return result.rows;
  }

  async getAlbumById(id) {
    const albumQuery = await db.query('SELECT * FROM albums WHERE id = $1', [id]);
    if (!albumQuery.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const songsQuery = await db.query(
      'SELECT id, title, performer FROM songs WHERE album_id = $1',
      [id]
    );

    return {
      ...albumQuery.rows[0],
      songs: songsQuery.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await db.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await db.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
