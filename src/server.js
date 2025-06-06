const dotenv = require('dotenv');
dotenv.config();

const init = require('./app');

init()
  .then((server) => {
    server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
  })
  .catch((err) => {
    console.error('Gagal memulai server:', err);
  });
