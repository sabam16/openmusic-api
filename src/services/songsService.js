const { nanoid } = require('nanoid');
const db = require('../models/db');
const NotFoundError = require('../exceptions/NotFoundError');

class SongsService {
  constructor(albumsService) {
    this._albumsService = albumsService;
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    // Validasi albumId jika disertakan
    if (albumId) {
      try {
        await this._albumsService.getAlbumById(albumId);
      } catch (error) {
        throw new NotFoundError('Album tidak ditemukan');
      }
    }

    const id = `song-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO songs (id, title, year, genre, performer, duration, album_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await db.query(query);
    return result.rows[0].id;
  }

  async getSongs({title, performer}) {
    let baseQuery = 'SELECT id, title, performer FROM songs';
    const conditions = [];
    const values = [];
    if (title) {
      values.push(`%${title.toLowerCase()}%`);
    conditions.push(`LOWER(title) LIKE $${values.length}`);
    }
     if (performer) {
    values.push(`%${performer.toLowerCase()}%`);
    conditions.push(`LOWER(performer) LIKE $${values.length}`);
  }
   if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }
    if(!title && !performer){
      const result = await db.query('SELECT id, title, performer FROM songs');
    }
    const result = await db.query(baseQuery, values);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await db.query(query);
    if (!result.rowCount) throw new NotFoundError('Lagu tidak ditemukan');
    return result.rows[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: `UPDATE songs SET title = $1, year = $2, genre = $3,
             performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, id],
    };
    const result = await db.query(query);
    if (!result.rowCount) throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await db.query(query);
    if (!result.rowCount) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
  }
}

module.exports = SongsService;
