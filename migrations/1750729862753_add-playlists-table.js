exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: { type: 'text', primaryKey: true },
    name: { type: 'text', notNull: true },
    owner: { type: 'text', notNull: true, references: 'users(id)', onDelete: 'cascade' },
  });

  pgm.createTable('playlist_songs', {
    id: { type: 'text', primaryKey: true },
    playlist_id: { type: 'text', notNull: true, references: 'playlists(id)', onDelete: 'cascade' },
    song_id: { type: 'text', notNull: true, references: 'songs(id)', onDelete: 'cascade' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
  pgm.dropTable('playlists');
};
