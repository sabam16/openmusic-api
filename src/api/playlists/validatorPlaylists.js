const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

/* ✅ Schema untuk membuat playlist */
const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

/* ✅ Schema untuk menambahkan lagu ke playlist */
const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const result = PlaylistPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },

  validatePlaylistSongPayload: (payload) => {
    const result = PlaylistSongPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
