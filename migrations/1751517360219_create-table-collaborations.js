exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"playlists"',
      onDelete: 'cascade',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TIMESTAMP',
    },
  });

  pgm.createIndex('collaborations', 'playlist_id');
  pgm.createIndex('collaborations', 'user_id');
  pgm.createIndex('collaborations', ['playlist_id', 'user_id'], { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};